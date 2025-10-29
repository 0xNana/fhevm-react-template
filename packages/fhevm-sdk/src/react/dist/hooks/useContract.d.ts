import type { FhevmInstance } from "@fhevm/core";
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
export declare function useContract(instance: FhevmInstance | null, options: UseContractOptions): UseContractReturn;
//# sourceMappingURL=useContract.d.ts.map