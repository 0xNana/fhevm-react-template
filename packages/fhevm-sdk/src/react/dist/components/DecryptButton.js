import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useFHEVMContext } from "./FHEVMProvider.js";
/**
 * Decrypt Button component
 *
 * A pre-built button component that handles decryption with loading states
 * and error handling.
 */
export function DecryptButton({ handle, contractAddress: _contractAddress, signature, usePublicDecrypt = false, onDecrypted, onError, children, buttonProps = {} }) {
    const { instance } = useFHEVMContext();
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(null);
    const handleDecrypt = async () => {
        if (!instance) {
            const err = new Error("FHEVM instance not available");
            setError(err);
            onError?.(err);
            return;
        }
        setIsDecrypting(true);
        setError(null);
        try {
            let decrypted;
            if (usePublicDecrypt) {
                // Use public decryption (no signature required)
                decrypted = Number(await instance.publicDecrypt([handle]));
            }
            else if (signature) {
                // Use user decryption with signature
                decrypted = Number(await instance.userDecrypt([{ handle, contractAddress: _contractAddress }], '', // privateKey
                '', // publicKey
                signature, [_contractAddress], '', // userAddress
                0, // startTimestamp
                0 // durationDays
                ));
            }
            else {
                throw new Error("Either signature or usePublicDecrypt must be provided");
            }
            onDecrypted?.(decrypted);
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onError?.(error);
        }
        finally {
            setIsDecrypting(false);
        }
    };
    return (_jsxs("button", { ...buttonProps, onClick: handleDecrypt, disabled: !instance || isDecrypting, style: {
            opacity: !instance || isDecrypting ? 0.6 : 1,
            cursor: !instance || isDecrypting ? "not-allowed" : "pointer",
            ...buttonProps.style
        }, children: [isDecrypting ? "Decrypting..." : children, error && (_jsx("div", { style: { color: "red", fontSize: "0.8em", marginTop: "4px" }, children: error.message }))] }));
}
//# sourceMappingURL=DecryptButton.js.map