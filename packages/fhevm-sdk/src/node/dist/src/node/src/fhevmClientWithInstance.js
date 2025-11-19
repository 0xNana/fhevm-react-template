import { createInstance } from '@zama-fhe/relayer-sdk/node';
import { FHEVMError, FHEVMNotInitializedError, FHEVMEncryptionError, FHEVMDecryptionError } from '../../types.js';
import { ethers } from 'ethers';
// ZamaEthereumConfig addresses for Sepolia (chainId 11155111)
// These addresses are dynamically resolved by ZamaEthereumConfig based on chainId
const getZamaEthereumConfig = (chainId) => {
    // For Sepolia (11155111) - default for now
    // In v0.9, ZamaEthereumConfig dynamically resolves based on chainId
    if (chainId === 11155111) {
        return {
            aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
            kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
            inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
            verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
            verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
            chainId: 11155111,
            gatewayChainId: 55815,
            relayerUrl: 'https://relayer.testnet.zama.cloud',
        };
    }
    // For other chains, you may need to add their addresses
    throw new FHEVMError(`Unsupported chainId: ${chainId}`, 'UNSUPPORTED_CHAIN');
};
/**
 * Create an EIP-1193 compatible provider from an RPC URL
 * This is required for Node.js environments where we need to wrap ethers.JsonRpcProvider
 * to match the EIP-1193 interface expected by the relayer SDK
 */
function createEIP1193Provider(rpcUrl, chainId) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return {
        request: async ({ method, params }) => {
            switch (method) {
                case 'eth_chainId':
                    return `0x${chainId.toString(16)}`;
                case 'eth_accounts':
                    return [];
                case 'eth_requestAccounts':
                    return [];
                case 'eth_call':
                    if (params && params[0]) {
                        return await provider.call(params[0]);
                    }
                    throw new Error('eth_call requires transaction object');
                case 'eth_sendTransaction':
                    if (params && params[0]) {
                        // Note: This requires a signer, which should be handled by the caller
                        throw new Error('eth_sendTransaction requires a signer. Use a wallet provider instead.');
                    }
                    throw new Error('eth_sendTransaction requires transaction object');
                case 'eth_getBlockByNumber':
                case 'eth_getBlockByHash':
                case 'eth_getTransactionReceipt':
                case 'eth_getCode':
                case 'eth_estimateGas':
                    // Delegate to ethers provider
                    return await provider.send(method, params || []);
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        },
        on: () => { },
        removeListener: () => { }
    };
}
/**
 * FHEVM Client with Real Instance - Node.js implementation
 *
 * This class wraps a real FhevmInstance from the relayer SDK
 * and provides the same interface as the core FHEVMClient.
 */
export class FHEVMClientWithInstance {
    _instance;
    _config;
    _isInitialized = false;
    constructor(instance, config, _events) {
        this._instance = instance;
        this._config = config;
        this._isInitialized = true;
    }
    /**
     * Initialize the client (already initialized with real instance)
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        throw new FHEVMError("Client already initialized with real instance", "ALREADY_INITIALIZED");
    }
    /**
     * Encrypt a value using the real FhevmInstance
     */
    async encrypt(value, options) {
        this._ensureInitialized();
        try {
            const { publicKey, contractAddress } = options;
            if (!contractAddress) {
                throw new FHEVMEncryptionError("Contract address is required for encryption");
            }
            // Create encrypted input using the real instance (following our working pattern)
            const input = this._instance.createEncryptedInput(contractAddress, publicKey);
            input.add32(value);
            const encrypted = await input.encrypt();
            if (!encrypted || !encrypted.handles || !encrypted.handles[0]) {
                throw new FHEVMEncryptionError("Encryption failed - no handle returned");
            }
            if (!encrypted.inputProof) {
                throw new FHEVMEncryptionError("Encryption failed - no inputProof returned");
            }
            // Convert Uint8Array to hex strings (following our working pattern)
            const toHex = (data) => {
                return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
            };
            return {
                handles: encrypted.handles.map(handle => toHex(handle)),
                inputProof: toHex(encrypted.inputProof)
            };
        }
        catch (error) {
            throw new FHEVMEncryptionError(`Failed to encrypt value: ${error instanceof Error ? error.message : String(error)}`, error);
        }
    }
    /**
     * Decrypt an encrypted value using the real FhevmInstance
     */
    async decrypt(options) {
        this._ensureInitialized();
        try {
            const { handle, contractAddress, signature, usePublicDecrypt } = options;
            if (usePublicDecrypt) {
                // Use public decryption (no signature required)
                // SDK 0.3.0-5 returns: { clearValues: {...}, abiEncodedClearValues: '...', decryptionProof: '...' }
                const result = await this._instance.publicDecrypt([handle]);
                // Handle different result structures
                let decryptedValue;
                if (result && typeof result === 'object') {
                    // Check for SDK 0.3.0-5 format with clearValues
                    if (result.clearValues && typeof result.clearValues === 'object') {
                        const clearValues = result.clearValues;
                        decryptedValue = clearValues[handle] || Object.values(clearValues)[0];
                    }
                    else if (Array.isArray(result)) {
                        // Legacy array format
                        decryptedValue = result[0];
                    }
                    else {
                        // Try direct handle lookup (legacy format)
                        const resultObj = result;
                        decryptedValue = resultObj[handle] || Object.values(resultObj)[0];
                    }
                }
                else {
                    // Direct value
                    decryptedValue = result;
                }
                if (decryptedValue === undefined || decryptedValue === null) {
                    throw new FHEVMDecryptionError('Decryption returned no value');
                }
                // Convert BigInt or number to regular number
                return typeof decryptedValue === 'bigint' ? Number(decryptedValue) : Number(decryptedValue);
            }
            else if (signature) {
                // Use user decryption with signature (following our working pattern)
                if (typeof signature === 'string') {
                    // If signature is a string, we can't extract the keys - this is an error
                    throw new FHEVMDecryptionError('String signature not supported - please use FhevmDecryptionSignature object');
                }
                const decrypted = await this._instance.userDecrypt([{ handle, contractAddress }], signature.privateKey, signature.publicKey, signature.signature, signature.contractAddresses, signature.userAddress, signature.startTimestamp, signature.durationDays);
                // Handle different possible result structures (following our working pattern)
                let decryptedValue;
                if (decrypted && typeof decrypted === 'object' && !Array.isArray(decrypted)) {
                    const handleKeys = Object.keys(decrypted);
                    if (handleKeys.length > 0) {
                        const firstKey = handleKeys[0];
                        if (firstKey) {
                            decryptedValue = decrypted[firstKey];
                        }
                        else {
                            throw new FHEVMDecryptionError('Decryption result object has no valid keys');
                        }
                    }
                    else {
                        throw new FHEVMDecryptionError('Decryption result object has no keys');
                    }
                }
                else if (Array.isArray(decrypted) && decrypted.length > 0) {
                    decryptedValue = decrypted[0];
                }
                else if (typeof decrypted === 'number') {
                    decryptedValue = decrypted;
                }
                else if (typeof decrypted === 'bigint') {
                    decryptedValue = Number(decrypted);
                }
                else {
                    throw new FHEVMDecryptionError(`Unexpected decryption result structure: ${JSON.stringify(decrypted)}`);
                }
                return decryptedValue;
            }
            else {
                throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
            }
        }
        catch (error) {
            throw new FHEVMDecryptionError(`Failed to decrypt value: ${error instanceof Error ? error.message : String(error)}`, error);
        }
    }
    /**
     * Get the FhevmInstance (for advanced usage)
     */
    getInstance() {
        return this._instance;
    }
    /**
     * Check if the client is ready
     */
    isReady() {
        return this._isInitialized && this._instance !== null;
    }
    /**
     * Get the current status
     */
    getStatus() {
        return this.isReady() ? "ready" : "error";
    }
    /**
     * Get the current error (if any)
     */
    getError() {
        return null; // Real instance doesn't have errors in this context
    }
    /**
     * Refresh/reinitialize the client
     */
    async refresh() {
        // For real instances, we need to recreate
        const baseConfig = getZamaEthereumConfig(this._config.chainId);
        const eip1193Provider = createEIP1193Provider(this._config.rpcUrl, this._config.chainId);
        const newInstance = await createInstance({
            ...baseConfig,
            network: eip1193Provider
        });
        this._instance = newInstance;
    }
    /**
     * Destroy the client
     */
    destroy() {
        this._isInitialized = false;
        // Note: FhevmInstance doesn't have a destroy method
    }
    // Private methods
    _ensureInitialized() {
        if (!this._isInitialized || !this._instance) {
            throw new FHEVMNotInitializedError();
        }
    }
}
/**
 * Create a real FHEVM client for Node.js using the relayer SDK
 *
 * This function creates an EIP-1193 compatible provider wrapper around
 * the RPC URL and initializes the FHEVM instance with proper configuration.
 *
 * @param config FHEVM configuration with RPC URL and chain ID
 * @param events Optional event handlers
 * @returns FHEVM client with real instance
 */
export async function createRealFHEVMClientForNode(config, events) {
    try {
        console.log('[FHEVM] Creating real FHEVM instance...');
        console.log(`[FHEVM] RPC URL: ${config.rpcUrl}`);
        console.log(`[FHEVM] Chain ID: ${config.chainId}`);
        // Get base configuration for the chain
        const baseConfig = getZamaEthereumConfig(config.chainId);
        // Create EIP-1193 provider wrapper (required for Node.js)
        // The relayer SDK expects an EIP-1193 provider, not just an RPC URL string
        const eip1193Provider = createEIP1193Provider(config.rpcUrl, config.chainId);
        const fhevmConfig = {
            ...baseConfig,
            network: eip1193Provider
        };
        console.log(`[FHEVM] Relayer URL: ${fhevmConfig.relayerUrl}`);
        console.log(`[FHEVM] ACL Contract: ${fhevmConfig.aclContractAddress}`);
        const fhevmInstance = await createInstance(fhevmConfig);
        console.log('[FHEVM] Real FHEVM instance created successfully!');
        return new FHEVMClientWithInstance(fhevmInstance, config, events);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[FHEVM] Failed to create real instance:', errorMessage);
        // Provide more helpful error messages for common issues
        if (errorMessage.includes('Bad JSON') || errorMessage.includes("didn't response correctly") || errorMessage.includes('fetch')) {
            throw new FHEVMError(`Relayer service communication failed. This may indicate:\n` +
                `  1. The relayer service at ${getZamaEthereumConfig(config.chainId).relayerUrl} is temporarily unavailable\n` +
                `  2. Network connectivity issues\n` +
                `  3. Invalid RPC URL: ${config.rpcUrl}\n` +
                `Please check your network connection and RPC URL, and try again later.`, "REAL_INSTANCE_CREATION_FAILED", error);
        }
        throw new FHEVMError(`Failed to create real FHEVM instance: ${errorMessage}`, "REAL_INSTANCE_CREATION_FAILED", error);
    }
}
//# sourceMappingURL=fhevmClientWithInstance.js.map