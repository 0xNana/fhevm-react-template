
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { 
  FHEVMConfig, 
  FHEVMState, 
  FHEVMStatus, 
  EncryptionOptions,
  DecryptionOptions,
  FHEVMEvents,
} from "./types.js";
import { 
  FHEVMNotInitializedError,
  FHEVMEncryptionError,
  FHEVMDecryptionError
} from "./types.js";
import { createFhevmInstance } from "./internal/fhevm.js";

/**
 * Universal FHEVM Client - Framework agnostic core for FHEVM operations
 * 
 * This is the main client class that provides a simple, intuitive API
 * for FHEVM operations across all frameworks.
 */
export class FHEVMClient {
  private _state: FHEVMState = {
    status: "idle",
    instance: null,
    error: null,
    isInitialized: false
  };

  private _config: FHEVMConfig;
  private _events: FHEVMEvents;
  private _abortController: AbortController | null = null;

  constructor(config: FHEVMConfig, events?: FHEVMEvents) {
    this._config = config;
    this._events = events || {};
  }

  /**
   * Initialize the FHEVM client
   */
  async initialize(): Promise<void> {
    if (this._state.isInitialized) {
      return;
    }

    this._setStatus("loading");
    this._abortController = new AbortController();

    try {
      // Merge user signal with internal abort controller
      const signal = this._config.signal 
        ? this._createMergedSignal(this._config.signal, this._abortController.signal)
        : this._abortController.signal;

      const instance = await createFhevmInstance({
        provider: this._config.rpcUrl,
        chainId: this._config.chainId,
        ...(this._config.mockChains && { mockChains: this._config.mockChains }),
        signal,
        onStatusChange: (status) => {
          console.log(`[FHEVM] Status: ${status}`);
        }
      });

      this._state.instance = instance;
      this._state.isInitialized = true;
      this._setStatus("ready");
      
      this._events.onReady?.(instance);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Encrypt a value using FHEVM
   */
  async encrypt(value: number, options: EncryptionOptions): Promise<string> {
    this._ensureInitialized();

    try {
      const { publicKey, contractAddress } = options;
      
      if (!this._state.instance) {
        throw new FHEVMEncryptionError("FHEVM instance not available");
      }

      if (!contractAddress) {
        throw new FHEVMEncryptionError("Contract address is required for encryption");
      }

      // Create encrypted input and encrypt the value
      const input = this._state.instance.createEncryptedInput(contractAddress, publicKey);
      input.add32(value);
      const encrypted = await input.encrypt();
      if (!encrypted.handles[0]) {
        throw new FHEVMEncryptionError("Encryption failed - no handle returned");
      }
      return encrypted.handles[0].toString();
    } catch (error) {
      throw new FHEVMEncryptionError(
        `Failed to encrypt value: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * Decrypt an encrypted value
   */
  async decrypt(options: DecryptionOptions): Promise<number> {
    this._ensureInitialized();

    try {
      const { handle, contractAddress, signature, usePublicDecrypt } = options;

      if (!this._state.instance) {
        throw new FHEVMDecryptionError("FHEVM instance not available");
      }

      if (usePublicDecrypt) {
        // Use public decryption (no signature required)
        const decrypted = await this._state.instance.publicDecrypt([handle]);
        return Number(decrypted);
      } else if (signature) {
        // Use user decryption with signature
        if (typeof signature === 'string') {
          // For string signatures, we can't extract the keys - this is an error
          throw new FHEVMDecryptionError('String signature not supported - please use FhevmDecryptionSignature object')
        }
        
        const decrypted = await this._state.instance.userDecrypt(
          [{ handle, contractAddress }],
          signature.privateKey,
          signature.publicKey,
          signature.signature,
          signature.contractAddresses,
          signature.userAddress,
          signature.startTimestamp,
          signature.durationDays
        );
        return Number(decrypted[handle]);
      } else {
        throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
      }
    } catch (error) {
      throw new FHEVMDecryptionError(
        `Failed to decrypt value: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * Get the current state of the client
   */
  getState(): FHEVMState {
    return { ...this._state };
  }

  /**
   * Get the FHEVM instance (if initialized)
   */
  getInstance(): FhevmInstance | null {
    return this._state.instance;
  }

  /**
   * Check if the client is ready
   */
  isReady(): boolean {
    return this._state.status === "ready" && this._state.instance !== null;
  }

  /**
   * Get the current status
   */
  getStatus(): FHEVMStatus {
    return this._state.status;
  }

  /**
   * Get the current error (if any)
   */
  getError(): Error | null {
    return this._state.error;
  }

  /**
   * Refresh/reinitialize the client
   */
  async refresh(): Promise<void> {
    this._abortController?.abort();
    this._state = {
      status: "idle",
      instance: null,
      error: null,
      isInitialized: false
    };
    await this.initialize();
  }

  /**
   * Destroy the client and cleanup resources
   */
  destroy(): void {
    this._abortController?.abort();
    this._state = {
      status: "idle",
      instance: null,
      error: null,
      isInitialized: false
    };
  }

  // Private methods

  private _ensureInitialized(): void {
    if (!this._state.isInitialized || !this._state.instance) {
      throw new FHEVMNotInitializedError();
    }
  }

  private _setStatus(status: FHEVMStatus): void {
    this._state.status = status;
    this._events.onStatusChange?.(status);
  }

  private _handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this._state.error = err;
    this._state.status = "error";
    this._events.onError?.(err);
  }

  private _createMergedSignal(userSignal: AbortSignal, internalSignal: AbortSignal): AbortSignal {
    const controller = new AbortController();
    
    const abort = () => controller.abort();
    
    userSignal.addEventListener('abort', abort);
    internalSignal.addEventListener('abort', abort);
    
    return controller.signal;
  }
}

/**
 * Create a new FHEVM client instance
 */
export function createFHEVMClient(config: FHEVMConfig, events?: FHEVMEvents): FHEVMClient {
  return new FHEVMClient(config, events);
}
