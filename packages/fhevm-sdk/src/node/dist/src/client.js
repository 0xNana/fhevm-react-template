import { FHEVMNotInitializedError, FHEVMEncryptionError, FHEVMDecryptionError } from "./types.js";
import { createFhevmInstance } from "./internal/fhevm.js";
import { logger } from "./utilities/index.js";
/**
 * Universal FHEVM Client - Framework agnostic core for FHEVM operations
 *
 * This is the main client class that provides a simple, intuitive API
 * for FHEVM operations across all frameworks.
 */
export class FHEVMClient {
    _state = {
        status: "idle",
        instance: null,
        error: null,
        isInitialized: false
    };
    _config;
    _events;
    _abortController = null;
    constructor(config, events) {
        this._config = config;
        this._events = events || {};
    }
    /**
     * Initialize the FHEVM client
     */
    async initialize() {
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
                    logger.debug(`Status: ${status}`);
                }
            });
            this._state.instance = instance;
            this._state.isInitialized = true;
            this._setStatus("ready");
            this._events.onReady?.(instance);
        }
        catch (error) {
            this._handleError(error);
        }
    }
    /**
     * Encrypt a value using FHEVM
     */
    async encrypt(value, options) {
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
        }
        catch (error) {
            throw new FHEVMEncryptionError(`Failed to encrypt value: ${error instanceof Error ? error.message : String(error)}`, error);
        }
    }
    /**
     * Decrypt an encrypted value
     */
    async decrypt(options) {
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
            }
            else if (signature) {
                // Use user decryption with signature
                if (typeof signature === 'string') {
                    // For string signatures, we can't extract the keys - this is an error
                    throw new FHEVMDecryptionError('String signature not supported - please use FhevmDecryptionSignature object');
                }
                const decrypted = await this._state.instance.userDecrypt([{ handle, contractAddress }], signature.privateKey, signature.publicKey, signature.signature, signature.contractAddresses, signature.userAddress, signature.startTimestamp, signature.durationDays);
                // Handle different possible result structures
                if (decrypted && typeof decrypted === 'object' && !Array.isArray(decrypted)) {
                    const handleKeys = Object.keys(decrypted);
                    if (handleKeys.length > 0 && handleKeys[0]) {
                        const value = decrypted[handleKeys[0]];
                        // Handle both hex strings and numbers
                        if (typeof value === 'string' && value.startsWith('0x')) {
                            return Number(BigInt(value));
                        }
                        return Number(value);
                    }
                }
                // Fallback: try direct handle access
                const fallbackValue = decrypted[handle] || decrypted;
                if (typeof fallbackValue === 'string' && fallbackValue.startsWith('0x')) {
                    return Number(BigInt(fallbackValue));
                }
                return Number(fallbackValue);
            }
            else {
                throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
            }
        }
        catch (error) {
            throw new FHEVMDecryptionError(`Failed to decrypt value: ${error instanceof Error ? error.message : String(error)}`, error);
        }
    }
    /**
     * Get the current state of the client
     */
    getState() {
        return { ...this._state };
    }
    /**
     * Get the FHEVM instance (if initialized)
     */
    getInstance() {
        return this._state.instance;
    }
    /**
     * Check if the client is ready
     */
    isReady() {
        return this._state.status === "ready" && this._state.instance !== null;
    }
    /**
     * Get the current status
     */
    getStatus() {
        return this._state.status;
    }
    /**
     * Get the current error (if any)
     */
    getError() {
        return this._state.error;
    }
    /**
     * Refresh/reinitialize the client
     */
    async refresh() {
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
    destroy() {
        this._abortController?.abort();
        this._state = {
            status: "idle",
            instance: null,
            error: null,
            isInitialized: false
        };
    }
    // Private methods
    _ensureInitialized() {
        if (!this._state.isInitialized || !this._state.instance) {
            throw new FHEVMNotInitializedError();
        }
    }
    _setStatus(status) {
        this._state.status = status;
        this._events.onStatusChange?.(status);
    }
    _handleError(error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this._state.error = err;
        this._state.status = "error";
        this._events.onError?.(err);
    }
    _createMergedSignal(userSignal, internalSignal) {
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
export function createFHEVMClient(config, events) {
    return new FHEVMClient(config, events);
}
//# sourceMappingURL=client.js.map