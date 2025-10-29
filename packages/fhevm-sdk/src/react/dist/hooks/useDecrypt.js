import { useCallback, useState } from "react";
import { FHEVMDecryptionError } from "@fhevm/core";
/**
 * Hook for decrypting values with FHEVM
 *
 * Provides a simple interface for decrypting values, similar to wagmi's
 * useContractRead pattern.
 */
export function useDecrypt(instance, options) {
    const [data, setData] = useState(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(null);
    const decrypt = useCallback(async () => {
        if (!instance) {
            const err = new FHEVMDecryptionError("FHEVM instance not available");
            setError(err);
            throw err;
        }
        setIsDecrypting(true);
        setError(null);
        try {
            let decrypted;
            if (options.usePublicDecrypt) {
                // Use public decryption (no signature required)
                decrypted = Number(await instance.publicDecrypt([options.handle]));
            }
            else if (options.signature) {
                // Use user decryption with signature
                decrypted = Number(await instance.userDecrypt([{ handle: options.handle, contractAddress: options.contractAddress }], '', // privateKey
                '', // publicKey
                options.signature, [options.contractAddress], '', // userAddress
                0, // startTimestamp
                0 // durationDays
                ));
            }
            else {
                throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
            }
            setData(decrypted);
            return decrypted;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            throw error;
        }
        finally {
            setIsDecrypting(false);
        }
    }, [instance, options.handle, options.contractAddress, options.signature, options.usePublicDecrypt]);
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsDecrypting(false);
    }, []);
    return {
        decrypt,
        data,
        isDecrypting,
        error,
        reset
    };
}
//# sourceMappingURL=useDecrypt.js.map