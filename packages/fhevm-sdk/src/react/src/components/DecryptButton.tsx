import React, { useState, type ReactNode } from "react";
import { useFHEVMContext } from "./FHEVMProvider.js";

export interface DecryptButtonProps {
  /** Encrypted handle to decrypt */
  handle: string;
  /** Contract address */
  contractAddress: string;
  /** User signature for userDecrypt */
  signature?: string;
  /** Use public decryption (no signature required) */
  usePublicDecrypt?: boolean;
  /** Callback when decryption is complete */
  onDecrypted?: (decrypted: number) => void;
  /** Callback when decryption fails */
  onError?: (error: Error) => void;
  /** Button content */
  children: ReactNode;
  /** Additional button props */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Decrypt Button component
 * 
 * A pre-built button component that handles decryption with loading states
 * and error handling.
 */
export function DecryptButton({
  handle,
  contractAddress: _contractAddress,
  signature,
  usePublicDecrypt = false,
  onDecrypted,
  onError,
  children,
  buttonProps = {}
}: DecryptButtonProps) {
  const { instance } = useFHEVMContext();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      let decrypted: number;

      if (usePublicDecrypt) {
        // Use public decryption (no signature required)
        decrypted = Number(await instance.publicDecrypt([handle]));
      } else if (signature) {
        // Use user decryption with signature
        decrypted = Number(await instance.userDecrypt(
          [{ handle, contractAddress: _contractAddress }],
          '', // privateKey
          '', // publicKey
          signature,
          [_contractAddress],
          '', // userAddress
          0, // startTimestamp
          0  // durationDays
        ));
      } else {
        throw new Error("Either signature or usePublicDecrypt must be provided");
      }

      onDecrypted?.(decrypted);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <button
      {...buttonProps}
      onClick={handleDecrypt}
      disabled={!instance || isDecrypting}
      style={{
        opacity: !instance || isDecrypting ? 0.6 : 1,
        cursor: !instance || isDecrypting ? "not-allowed" : "pointer",
        ...buttonProps.style
      }}
    >
      {isDecrypting ? "Decrypting..." : children}
      {error && (
        <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>
          {error.message}
        </div>
      )}
    </button>
  );
}
