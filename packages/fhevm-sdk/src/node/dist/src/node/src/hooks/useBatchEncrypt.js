import { batchEncrypt } from '../utilities.js';
/**
 * Batch encrypt hook for Node.js
 *
 * Provides a React-like hook interface for batch encryption operations.
 * Similar to wagmi's useBatchEncrypt but for Node.js environments.
 */
export function useBatchEncrypt(config) {
    let isPending = false;
    let error = null;
    let handles = null;
    let progress = 0;
    const batchEncryptValues = async (values, publicKey) => {
        isPending = true;
        error = null;
        progress = 0;
        try {
            const encryptedHandles = await batchEncrypt(values, publicKey, config);
            handles = encryptedHandles;
            progress = 1;
            isPending = false;
            return encryptedHandles;
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
        handles = null;
        progress = 0;
    };
    return {
        batchEncrypt: batchEncryptValues,
        isPending,
        error,
        handles,
        progress,
        reset
    };
}
//# sourceMappingURL=useBatchEncrypt.js.map