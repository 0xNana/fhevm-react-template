import { useCallback, useState } from "react";
import type { FhevmInstance } from "../../../index.js";
import { FHEVMDecryptionError } from "../../../index.js";

export interface UseDecryptOptions {
  /** Encrypted handle to decrypt */
  handle: string;
  /** Contract address */
  contractAddress: string;
  /** User signature for userDecrypt */
  signature?: string;
  /** Use public decryption (no signature required) */
  usePublicDecrypt?: boolean;
}

export interface UseDecryptReturn {
  /** Decrypt the handle */
  decrypt: () => Promise<number>;
  /** Current decrypted result */
  data: number | null;
  /** Whether decryption is in progress */
  isDecrypting: boolean;
  /** Current error (if any) */
  error: Error | null;
  /** Reset the hook state */
  reset: () => void;
}

/**
 * Hook for decrypting values with FHEVM
 * 
 * Provides a simple interface for decrypting values, similar to wagmi's
 * useContractRead pattern.
 */
export function useDecrypt(
  instance: FhevmInstance | null,
  options: UseDecryptOptions
): UseDecryptReturn {
  const [data, setData] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(async (): Promise<number> => {
    if (!instance) {
      const err = new FHEVMDecryptionError("FHEVM instance not available");
      setError(err);
      throw err;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      let decrypted: number;

      if (options.usePublicDecrypt) {
        // Use public decryption (no signature required)
        decrypted = Number(await instance.publicDecrypt([options.handle]));
      } else if (options.signature) {
        // Use user decryption with signature
        decrypted = Number(await instance.userDecrypt(
          [{ handle: options.handle, contractAddress: options.contractAddress }],
          '', // privateKey
          '', // publicKey
          options.signature,
          [options.contractAddress],
          '', // userAddress
          0, // startTimestamp
          0  // durationDays
        ));
      } else {
        throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
      }

      setData(decrypted);
      return decrypted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  }, [instance, options.handle, options.contractAddress, options.signature, options.usePublicDecrypt]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsDecrypting(false);
  }, []);

  return {
    decrypt,
    data,
    isDecrypting,
    error,
    reset
  };
}
