import { decryptValue, userDecryptWithSignature, publicDecrypt } from '../utilities.js';
/**
 * Decrypt hook for Node.js
 *
 * Provides a React-like hook interface for decryption operations.
 * Similar to wagmi's useDecrypt but for Node.js environments.
 */
export function useDecrypt(config) {
    let isPending = false;
    let error = null;
    let value = null;
    const decrypt = async (options) => {
        isPending = true;
        error = null;
        try {
            let decryptedValue;
            if (options.usePublicDecrypt) {
                decryptedValue = await publicDecrypt(options.handle, options.contractAddress, config);
            }
            else if (options.signature) {
                decryptedValue = await userDecryptWithSignature(options.handle, options.contractAddress, options.signature, config);
            }
            else {
                decryptedValue = await decryptValue(options.handle, options.contractAddress, config, {
                    ...(options.signature && { signature: options.signature }),
                    ...(options.usePublicDecrypt !== undefined && { usePublicDecrypt: options.usePublicDecrypt })
                });
            }
            value = decryptedValue;
            isPending = false;
            return decryptedValue;
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            isPending = false;
            throw error;
        }
    };
    const reset = () => {
        isPending = false;
        error = null;
        value = null;
    };
    return {
        decrypt,
        isPending,
        error,
        value,
        reset
    };
}
//# sourceMappingURL=useDecrypt.js.map