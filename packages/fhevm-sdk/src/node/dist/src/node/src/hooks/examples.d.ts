/**
 * Examples of using FHEVM hooks in Node.js
 *
 * This file demonstrates how to use the wagmi-like hooks
 * for FHEVM operations in Node.js environments.
 */
import type { WriteContractOptions } from './types.js';
export declare function basicFHEVMSetup(): Promise<import("./types.js").FHEVMHookResult>;
export declare function contractInteraction(): Promise<{
    contract: import("./types.js").ContractHookResult;
    data: any;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<any>;
}>;
export declare function writeToContract(): Promise<{
    write: (options?: Partial<WriteContractOptions>) => Promise<any>;
    isPending: boolean;
    error: Error | null;
    hash: string | null;
    receipt: any;
}>;
export declare function encryptionExample(): Promise<{
    encrypt: (value: number, publicKey: string) => Promise<string>;
    isPending: boolean;
    error: Error | null;
    handle: string | null;
}>;
export declare function decryptionExample(): Promise<{
    decrypt: (options: import("./types.js").DecryptOptions) => Promise<number>;
    isPending: boolean;
    error: Error | null;
    value: number | null;
}>;
export declare function batchEncryptionExample(): Promise<{
    batchEncrypt: (values: number[], publicKey: string) => Promise<string[]>;
    isPending: boolean;
    error: Error | null;
    handles: string[] | null;
    progress: number;
}>;
export declare function batchDecryptionExample(): Promise<{
    batchDecrypt: (options: import("./types.js").BatchDecryptOptions) => Promise<number[]>;
    isPending: boolean;
    error: Error | null;
    values: number[] | null;
    progress: number;
}>;
export declare function completeWorkflow(): Promise<void>;
//# sourceMappingURL=examples.d.ts.map