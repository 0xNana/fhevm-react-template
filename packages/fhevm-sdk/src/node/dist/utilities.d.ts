import { type FHEVMConfig, type FHEVMEvents } from "@fhevm/core";
/**
 * Create a FHEVM client for Node.js environments
 *
 * This is a convenience function that creates a FHEVM client with
 * Node.js-appropriate defaults and error handling.
 */
export declare function createFHEVMClientForNode(config: FHEVMConfig, events?: FHEVMEvents): import("@fhevm/core").FHEVMClient;
/**
 * Encrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for encrypting values in Node.js environments.
 */
export declare function encryptValue(value: number, publicKey: string, config: FHEVMConfig): Promise<string>;
/**
 * Decrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for decrypting values in Node.js environments.
 */
export declare function decryptValue(handle: string, contractAddress: string, config: FHEVMConfig, options?: {
    signature?: string;
    usePublicDecrypt?: boolean;
}): Promise<number>;
/**
 * Batch encrypt multiple values
 *
 * Utility for encrypting multiple values efficiently.
 */
export declare function batchEncrypt(values: number[], publicKey: string, config: FHEVMConfig): Promise<string[]>;
/**
 * Batch decrypt multiple handles
 *
 * Utility for decrypting multiple handles efficiently.
 */
export declare function batchDecrypt(handles: string[], contractAddress: string, config: FHEVMConfig, options?: {
    signature?: string;
    usePublicDecrypt?: boolean;
}): Promise<number[]>;
//# sourceMappingURL=utilities.d.ts.map