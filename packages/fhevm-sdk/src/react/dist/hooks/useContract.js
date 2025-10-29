import { useCallback, useState } from "react";
import { useEncrypt } from "./useEncrypt.js";
import { useDecrypt } from "./useDecrypt.js";
/**
 * Hook for contract-specific FHEVM operations
 *
 * Combines encryption and decryption functionality for a specific contract,
 * providing a convenient interface for contract interactions.
 */
export function useContract(instance, options) {
    const [error, setError] = useState(null);
    // Encryption hook
    const encryptHook = useEncrypt(instance, {
        publicKey: options.publicKey,
        contractAddress: options.address
    });
    // Decryption hook
    const decryptHook = useDecrypt(instance, {
        handle: "", // Will be set dynamically
        contractAddress: options.address
    });
    // Combined encrypt function
    const encrypt = useCallback(async (value) => {
        try {
            setError(null);
            return await encryptHook.encrypt(value);
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
    }, [encryptHook]);
    // Combined decrypt function
    const decrypt = useCallback(async (handle, signature, usePublicDecrypt = false) => {
        try {
            setError(null);
            // Update the decrypt hook options
            const decryptOptions = {
                handle,
                contractAddress: options.address,
                ...(signature && { signature }),
                usePublicDecrypt
            };
            // Create a new decrypt hook with updated options
            const tempDecryptHook = useDecrypt(instance, decryptOptions);
            return await tempDecryptHook.decrypt();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
    }, [instance, options.address]);
    // Reset function
    const reset = useCallback(() => {
        encryptHook.reset();
        decryptHook.reset();
        setError(null);
    }, [encryptHook, decryptHook]);
    // Combined state
    const isEncrypting = encryptHook.isEncrypting;
    const isDecrypting = decryptHook.isDecrypting;
    const encryptedData = encryptHook.data;
    const decryptedData = decryptHook.data;
    return {
        encrypt,
        decrypt,
        encryptedData,
        decryptedData,
        isEncrypting,
        isDecrypting,
        error,
        reset
    };
}
//# sourceMappingURL=useContract.js.map