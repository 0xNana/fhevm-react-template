import { useCallback, useState } from "react";
import type { FhevmInstance } from "../../../index.js";
import { useEncrypt } from "./useEncrypt.js";
import { useDecrypt, type UseDecryptOptions } from "./useDecrypt.js";

export interface UseContractOptions {
  /** Contract address */
  address: string;
  /** Contract ABI */
  abi: any[];
  /** Public key for encryption */
  publicKey: string;
}

export interface UseContractReturn {
  /** Encrypt a value for this contract */
  encrypt: (value: number) => Promise<string>;
  /** Decrypt a handle from this contract */
  decrypt: (handle: string, signature?: string, usePublicDecrypt?: boolean) => Promise<number>;
  /** Current encrypted result */
  encryptedData: string | null;
  /** Current decrypted result */
  decryptedData: number | null;
  /** Whether encryption is in progress */
  isEncrypting: boolean;
  /** Whether decryption is in progress */
  isDecrypting: boolean;
  /** Current error (if any) */
  error: Error | null;
  /** Reset the hook state */
  reset: () => void;
}

/**
 * Hook for contract-specific FHEVM operations
 * 
 * Combines encryption and decryption functionality for a specific contract,
 * providing a convenient interface for contract interactions.
 */
export function useContract(
  instance: FhevmInstance | null,
  options: UseContractOptions
): UseContractReturn {
  const [error, setError] = useState<Error | null>(null);

  // Encryption hook
  const encryptHook = useEncrypt(instance, {
    publicKey: options.publicKey,
    contractAddress: options.address
  });

  // Decryption hook
  const decryptHook = useDecrypt(instance, {
    handle: "", // Will be set dynamically
    contractAddress: options.address
  });

  // Combined encrypt function
  const encrypt = useCallback(async (value: number): Promise<string> => {
    try {
      setError(null);
      return await encryptHook.encrypt(value);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [encryptHook]);

  // Combined decrypt function
  const decrypt = useCallback(async (
    handle: string, 
    signature?: string, 
    usePublicDecrypt = false
  ): Promise<number> => {
    try {
      setError(null);
      
      // Update the decrypt hook options
      const decryptOptions: UseDecryptOptions = {
        handle,
        contractAddress: options.address,
        ...(signature && { signature }),
        usePublicDecrypt
      };

      // Create a new decrypt hook with updated options
      const tempDecryptHook = useDecrypt(instance, decryptOptions);
      return await tempDecryptHook.decrypt();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [instance, options.address]);

  // Reset function
  const reset = useCallback(() => {
    encryptHook.reset();
    decryptHook.reset();
    setError(null);
  }, [encryptHook, decryptHook]);

  // Combined state
  const isEncrypting = encryptHook.isEncrypting;
  const isDecrypting = decryptHook.isDecrypting;
  const encryptedData = encryptHook.data;
  const decryptedData = decryptHook.data;

  return {
    encrypt,
    decrypt,
    encryptedData,
    decryptedData,
    isEncrypting,
    isDecrypting,
    error,
    reset
  };
}
