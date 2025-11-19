import { encryptValue } from '../utilities.js';
/**
 * Encrypt hook for Node.js
 *
 * Provides a React-like hook interface for encryption operations.
 * Similar to wagmi's useEncrypt but for Node.js environments.
 */
export function useEncrypt(config) {
    let isPending = false;
    let error = null;
    let handle = null;
    const encrypt = async (value, publicKey) => {
        isPending = true;
        error = null;
        try {
            const encryptedHandle = await encryptValue(value, publicKey, config);
            handle = encryptedHandle;
            isPending = false;
            return encryptedHandle;
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
        handle = null;
    };
    return {
        encrypt,
        isPending,
        error,
        handle,
        reset
    };
}
//# sourceMappingURL=useEncrypt.js.map