import { useCallback, useState } from "react";
import type { FhevmInstance } from "../../../index.js";
import { FHEVMEncryptionError } from "../../../index.js";

export interface UseEncryptOptions {
  /** Public key for encryption */
  publicKey: string;
  /** Contract address (optional) */
  contractAddress?: string;
  /** Additional parameters */
  params?: Record<string, any>;
}

export interface UseEncryptReturn {
  /** Encrypt a value */
  encrypt: (value: number) => Promise<string>;
  /** Current encrypted result */
  data: string | null;
  /** Whether encryption is in progress */
  isEncrypting: boolean;
  /** Current error (if any) */
  error: Error | null;
  /** Reset the hook state */
  reset: () => void;
}

/**
 * Hook for encrypting values with FHEVM
 * 
 * Provides a simple interface for encrypting values, similar to wagmi's
 * useContractWrite pattern.
 */
export function useEncrypt(
  instance: FhevmInstance | null,
  options: UseEncryptOptions
): UseEncryptReturn {
  const [data, setData] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (value: number): Promise<string> => {
    if (!instance) {
      const err = new FHEVMEncryptionError("FHEVM instance not available");
      setError(err);
      throw err;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      // Create encrypted input and encrypt the value
      const input = instance.createEncryptedInput(options.contractAddress || '', options.publicKey);
      input.add32(value);
      const encrypted = await input.encrypt();
      if (!encrypted.handles[0]) {
        throw new Error("Encryption failed - no handle returned");
      }
      const encryptedString = encrypted.handles[0].toString();
      setData(encryptedString);
      return encryptedString;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  }, [instance, options.publicKey]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsEncrypting(false);
  }, []);

  return {
    encrypt,
    data,
    isEncrypting,
    error,
    reset
  };
}
