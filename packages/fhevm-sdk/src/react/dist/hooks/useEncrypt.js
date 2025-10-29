import { useCallback, useState } from "react";
import { FHEVMEncryptionError } from "@fhevm/core";
/**
 * Hook for encrypting values with FHEVM
 *
 * Provides a simple interface for encrypting values, similar to wagmi's
 * useContractWrite pattern.
 */
export function useEncrypt(instance, options) {
    const [data, setData] = useState(null);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [error, setError] = useState(null);
    const encrypt = useCallback(async (value) => {
        if (!instance) {
            const err = new FHEVMEncryptionError("FHEVM instance not available");
            setError(err);
            throw err;
        }
        setIsEncrypting(true);
        setError(null);
        try {
            // Create encrypted input and encrypt the value
            const input = instance.createEncryptedInput(options.contractAddress || '', options.publicKey);
            input.add32(value);
            const encrypted = await input.encrypt();
            if (!encrypted.handles[0]) {
                throw new Error("Encryption failed - no handle returned");
            }
            const encryptedString = encrypted.handles[0].toString();
            setData(encryptedString);
            return encryptedString;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
        finally {
            setIsEncrypting(false);
        }
    }, [instance, options.publicKey]);
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsEncrypting(false);
    }, []);
    return {
        encrypt,
        data,
        isEncrypting,
        error,
        reset
    };
}
//# sourceMappingURL=useEncrypt.js.map