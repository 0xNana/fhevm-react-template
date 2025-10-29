import { createFHEVMClient } from "@fhevm/core";
/**
 * Create a FHEVM client for Node.js environments
 *
 * This is a convenience function that creates a FHEVM client with
 * Node.js-appropriate defaults and error handling.
 */
export function createFHEVMClientForNode(config, events) {
    const nodeEvents = {
        ...events,
        onStatusChange: (status) => {
            console.log(`[FHEVM] Status: ${status}`);
            events?.onStatusChange?.(status);
        },
        onError: (error) => {
            console.error(`[FHEVM] Error: ${error.message}`);
            events?.onError?.(error);
        },
        onReady: (instance) => {
            console.log("[FHEVM] Client is ready!");
            events?.onReady?.(instance);
        }
    };
    return createFHEVMClient(config, nodeEvents);
}
/**
 * Encrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for encrypting values in Node.js environments.
 */
export async function encryptValue(value, publicKey, config) {
    const client = createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    return await client.encrypt(value, { publicKey });
}
/**
 * Decrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for decrypting values in Node.js environments.
 */
export async function decryptValue(handle, contractAddress, config, options) {
    const client = createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    return await client.decrypt({
        handle,
        contractAddress,
        ...(options?.signature && { signature: options.signature }),
        usePublicDecrypt: options?.usePublicDecrypt || false
    });
}
/**
 * Batch encrypt multiple values
 *
 * Utility for encrypting multiple values efficiently.
 */
export async function batchEncrypt(values, publicKey, config) {
    const client = createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (const value of values) {
        const encrypted = await client.encrypt(value, { publicKey });
        results.push(encrypted);
    }
    return results;
}
/**
 * Batch decrypt multiple handles
 *
 * Utility for decrypting multiple handles efficiently.
 */
export async function batchDecrypt(handles, contractAddress, config, options) {
    const client = createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (const handle of handles) {
        const decrypted = await client.decrypt({
            handle,
            contractAddress,
            ...(options?.signature && { signature: options.signature }),
            usePublicDecrypt: options?.usePublicDecrypt || false
        });
        results.push(decrypted);
    }
    return results;
}
//# sourceMappingURL=utilities.js.map