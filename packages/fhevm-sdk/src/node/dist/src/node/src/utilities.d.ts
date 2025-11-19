import { FHEVMClient } from "../../client.js";
import { FHEVMClientWithInstance } from "./fhevmClientWithInstance.js";
import type { FHEVMConfig, FHEVMEvents } from "../../types.js";
/**
 * Smart auto-detection for mock mode
 * Automatically enables mock mode when:
 * - Explicitly set via FHEVM_MOCK_MODE
 * - Running in test environment
 * - On Windows (Windows API issues)
 * - No RPC URL configured
 * - Using placeholder RPC URL
 */
export declare function shouldUseMockMode(config?: FHEVMConfig): boolean;
/**
 * Create a FHEVM client for Node.js environments
 *
 * This is a convenience function that creates a FHEVM client with
 * Node.js-appropriate defaults and error handling.
 *
 * @param config FHEVM configuration
 * @param events Optional event handlers
 * @param mockMode If true, uses mock mode (no Windows API required)
 */
export declare function createFHEVMClientForNode(config: FHEVMConfig, events?: FHEVMEvents, mockMode?: boolean): Promise<FHEVMClient | FHEVMClientWithInstance>;
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
/**
 * User decrypt with EIP-712 signing (Node.js utility)
 *
 * Decrypts a value using user's signature for authentication.
 * This requires the user to sign a message with their private key.
 */
export declare function userDecryptWithSignature(handle: string, contractAddress: string, signature: string, config: FHEVMConfig): Promise<number>;
/**
 * Public decrypt (Node.js utility)
 *
 * Decrypts a value using public decryption (no signature required).
 * This is useful for values that don't require user authentication.
 */
export declare function publicDecrypt(handle: string, contractAddress: string, config: FHEVMConfig): Promise<number>;
/**
 * Batch user decrypt with signatures (Node.js utility)
 *
 * Decrypts multiple values using user signatures for authentication.
 */
export declare function batchUserDecryptWithSignatures(handles: string[], contractAddress: string, signatures: string[], config: FHEVMConfig): Promise<number[]>;
/**
 * Batch public decrypt (Node.js utility)
 *
 * Decrypts multiple values using public decryption (no signatures required).
 */
export declare function batchPublicDecrypt(handles: string[], contractAddress: string, config: FHEVMConfig): Promise<number[]>;
//# sourceMappingURL=utilities.d.ts.map