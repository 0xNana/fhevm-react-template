import { createRealFHEVMClientForNode } from "./fhevmClientWithInstance.js";
/**
 * Smart auto-detection for mock mode
 * Automatically enables mock mode when:
 * - Explicitly set via FHEVM_MOCK_MODE
 * - Running in test environment
 * - On Windows (Windows API issues)
 * - No RPC URL configured
 * - Using placeholder RPC URL
 */
export function shouldUseMockMode(config) {
    // Explicit mock mode
    if (process.env.FHEVM_MOCK_MODE === 'true')
        return true;
    // Test environment
    if (process.env.NODE_ENV === 'test')
        return true;
    // Windows platform (Windows API issues)
    if (process.platform === 'win32')
        return true;
    // Auto-mock flag
    if (process.env.FHEVM_AUTO_MOCK === 'true')
        return true;
    // No RPC configured
    if (!process.env.RPC_URL && !process.env.FHEVM_RPC_URL)
        return true;
    // Using placeholder RPC URL
    const rpcUrl = process.env.RPC_URL || process.env.FHEVM_RPC_URL || '';
    if (rpcUrl.includes('YOUR_INFURA_KEY') || rpcUrl.includes('your_infura_key'))
        return true;
    // Config-based detection
    if (config && (!config.rpcUrl || config.rpcUrl.includes('YOUR_INFURA_KEY')))
        return true;
    return false;
}
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
export async function createFHEVMClientForNode(config, events, mockMode = false) {
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
    // Use mock mode if specified or if Windows API is not available
    if (mockMode || shouldUseMockMode(config)) {
        console.log('[FHEVM] Using mock mode (Windows API not available or explicitly requested)');
        return createMockFHEVMClient(config, nodeEvents);
    }
    // Try to create real FHEVM instance
    try {
        console.log('[FHEVM] Attempting to create real FHEVM instance...');
        return await createRealFHEVMClientForNode(config, nodeEvents);
    }
    catch (error) {
        console.warn('[FHEVM] Failed to create real instance, falling back to mock mode:', error);
        return createMockFHEVMClient(config, nodeEvents);
    }
}
/**
 * Create a mock FHEVM client for testing (no Windows API required)
 */
function createMockFHEVMClient(_config, events) {
    return {
        async initialize() {
            console.log("[FHEVM Mock] Initializing mock client...");
            events?.onStatusChange?.("loading");
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async init
            events?.onStatusChange?.("ready");
            events?.onReady?.(this);
        },
        isReady() {
            return true;
        },
        async encrypt(value, _options) {
            console.log(`[FHEVM Mock] Encrypting value: ${value}`);
            return `mock_encrypted_${value}_${Date.now()}`;
        },
        async decrypt(options) {
            const { handle } = options;
            console.log(`[FHEVM Mock] Decrypting handle: ${handle}`);
            // Extract value from mock handle
            const match = handle.match(/mock_encrypted_(\d+)_/);
            return match && match[1] ? parseInt(match[1], 10) : 0;
        }
    };
}
/**
 * Encrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for encrypting values in Node.js environments.
 */
export async function encryptValue(value, publicKey, config) {
    const mockMode = shouldUseMockMode(config);
    const client = await createFHEVMClientForNode(config, undefined, mockMode);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const result = await client.encrypt(value, { publicKey });
    // Handle both old string return and new object return
    if (typeof result === 'string') {
        return result;
    }
    else if (result && typeof result === 'object' && 'handles' in result && Array.isArray(result.handles) && result.handles.length > 0) {
        const firstHandle = result.handles[0];
        if (!firstHandle) {
            throw new Error('Encryption result has empty handles array');
        }
        return firstHandle; // Return first handle for backward compatibility
    }
    else {
        throw new Error("Unexpected encryption result format");
    }
}
/**
 * Decrypt a value using FHEVM (Node.js utility)
 *
 * Simple utility function for decrypting values in Node.js environments.
 */
export async function decryptValue(handle, contractAddress, config, options) {
    const mockMode = shouldUseMockMode(config);
    const client = await createFHEVMClientForNode(config, undefined, mockMode);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const decryptOptions = {
        handle,
        contractAddress,
        ...(options?.signature && { signature: options.signature }),
        usePublicDecrypt: options?.usePublicDecrypt || false
    };
    return await client.decrypt(decryptOptions);
}
/**
 * Batch encrypt multiple values
 *
 * Utility for encrypting multiple values efficiently.
 */
export async function batchEncrypt(values, publicKey, config) {
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (const value of values) {
        const encrypted = await client.encrypt(value, { publicKey });
        // Handle both old string return and new object return
        if (typeof encrypted === 'string') {
            results.push(encrypted);
        }
        else if (encrypted && typeof encrypted === 'object' && 'handles' in encrypted && Array.isArray(encrypted.handles) && encrypted.handles.length > 0) {
            const firstHandle = encrypted.handles[0];
            if (!firstHandle) {
                throw new Error('Encryption result has empty handles array');
            }
            results.push(firstHandle);
        }
        else {
            throw new Error("Unexpected encryption result format");
        }
    }
    return results;
}
/**
 * Batch decrypt multiple handles
 *
 * Utility for decrypting multiple handles efficiently.
 */
export async function batchDecrypt(handles, contractAddress, config, options) {
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (const handle of handles) {
        const decryptOptions = {
            handle,
            contractAddress,
            ...(options?.signature && { signature: options.signature }),
            usePublicDecrypt: options?.usePublicDecrypt || false
        };
        const decrypted = await client.decrypt(decryptOptions);
        results.push(decrypted);
    }
    return results;
}
/**
 * User decrypt with EIP-712 signing (Node.js utility)
 *
 * Decrypts a value using user's signature for authentication.
 * This requires the user to sign a message with their private key.
 */
export async function userDecryptWithSignature(handle, contractAddress, signature, config) {
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const decryptOptions = {
        handle,
        contractAddress,
        signature,
        usePublicDecrypt: false
    };
    return await client.decrypt(decryptOptions);
}
/**
 * Public decrypt (Node.js utility)
 *
 * Decrypts a value using public decryption (no signature required).
 * This is useful for values that don't require user authentication.
 */
export async function publicDecrypt(handle, contractAddress, config) {
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const decryptOptions = {
        handle,
        contractAddress,
        usePublicDecrypt: true
    };
    return await client.decrypt(decryptOptions);
}
/**
 * Batch user decrypt with signatures (Node.js utility)
 *
 * Decrypts multiple values using user signatures for authentication.
 */
export async function batchUserDecryptWithSignatures(handles, contractAddress, signatures, config) {
    if (handles.length !== signatures.length) {
        throw new Error("Number of handles must match number of signatures");
    }
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];
        const signature = signatures[i];
        if (!handle) {
            throw new Error(`Handle at index ${i} is undefined`);
        }
        if (typeof signature !== 'string') {
            throw new Error(`Signature required for handle ${handle}`);
        }
        const decryptOptions = {
            handle,
            contractAddress,
            signature,
            usePublicDecrypt: false
        };
        const decrypted = await client.decrypt(decryptOptions);
        results.push(decrypted);
    }
    return results;
}
/**
 * Batch public decrypt (Node.js utility)
 *
 * Decrypts multiple values using public decryption (no signatures required).
 */
export async function batchPublicDecrypt(handles, contractAddress, config) {
    const client = await createFHEVMClientForNode(config);
    await client.initialize();
    if (!client.isReady()) {
        throw new Error("FHEVM client is not ready");
    }
    const results = [];
    for (const handle of handles) {
        const decryptOptions = {
            handle,
            contractAddress,
            usePublicDecrypt: true
        };
        const decrypted = await client.decrypt(decryptOptions);
        results.push(decrypted);
    }
    return results;
}
//# sourceMappingURL=utilities.js.map