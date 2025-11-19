import { batchDecrypt, batchUserDecryptWithSignatures, batchPublicDecrypt } from '../utilities.js';
/**
 * Batch decrypt hook for Node.js
 *
 * Provides a React-like hook interface for batch decryption operations.
 * Similar to wagmi's useBatchDecrypt but for Node.js environments.
 */
export function useBatchDecrypt(config) {
    let isPending = false;
    let error = null;
    let values = null;
    let progress = 0;
    const batchDecryptValues = async (options) => {
        isPending = true;
        error = null;
        progress = 0;
        try {
            let decryptedValues;
            if (options.usePublicDecrypt) {
                decryptedValues = await batchPublicDecrypt(options.handles, options.contractAddress, config);
            }
            else if (options.signatures) {
                decryptedValues = await batchUserDecryptWithSignatures(options.handles, options.contractAddress, options.signatures, config);
            }
            else {
                const batchOptions = {};
                if (options.signatures && options.signatures.length > 0) {
                    batchOptions.signature = options.signatures[0];
                }
                if (options.usePublicDecrypt !== undefined) {
                    batchOptions.usePublicDecrypt = options.usePublicDecrypt;
                }
                decryptedValues = await batchDecrypt(options.handles, options.contractAddress, config, batchOptions);
            }
            values = decryptedValues;
            progress = 1;
            isPending = false;
            return decryptedValues;
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            isPending = false;
            progress = 0;
            throw error;
        }
    };
    const reset = () => {
        isPending = false;
        error = null;
        values = null;
        progress = 0;
    };
    return {
        batchDecrypt: batchDecryptValues,
        isPending,
        error,
        values,
        progress,
        reset
    };
}
//# sourceMappingURL=useBatchDecrypt.js.map