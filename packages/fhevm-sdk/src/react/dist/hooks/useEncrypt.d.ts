import type { FhevmInstance } from "@fhevm/core";
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
export declare function useEncrypt(instance: FhevmInstance | null, options: UseEncryptOptions): UseEncryptReturn;
//# sourceMappingURL=useEncrypt.d.ts.map