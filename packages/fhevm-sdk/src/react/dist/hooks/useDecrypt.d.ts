import type { FhevmInstance } from "@fhevm/core";
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
export declare function useDecrypt(instance: FhevmInstance | null, options: UseDecryptOptions): UseDecryptReturn;
//# sourceMappingURL=useDecrypt.d.ts.map