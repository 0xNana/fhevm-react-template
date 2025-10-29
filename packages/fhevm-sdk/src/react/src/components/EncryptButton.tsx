import React, { useState, type ReactNode } from "react";
import { useFHEVMContext } from "./FHEVMProvider.js";

export interface EncryptButtonProps {
  /** Value to encrypt */
  value: number;
  /** Public key for encryption */
  publicKey: string;
  /** Contract address (optional) */
  contractAddress?: string;
  /** Callback when encryption is complete */
  onEncrypted?: (encrypted: string) => void;
  /** Callback when encryption fails */
  onError?: (error: Error) => void;
  /** Button content */
  children: ReactNode;
  /** Additional button props */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Encrypt Button component
 * 
 * A pre-built button component that handles encryption with loading states
 * and error handling.
 */
export function EncryptButton({
  value,
  publicKey,
  contractAddress: _contractAddress,
  onEncrypted,
  onError,
  children,
  buttonProps = {}
}: EncryptButtonProps) {
  const { instance } = useFHEVMContext();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleEncrypt = async () => {
    if (!instance) {
      const err = new Error("FHEVM instance not available");
      setError(err);
      onError?.(err);
      return;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      // Create encrypted input and encrypt the value
      const input = instance.createEncryptedInput(_contractAddress || '', publicKey);
      input.add32(value);
      const encrypted = await input.encrypt();
      if (!encrypted.handles[0]) {
        throw new Error("Encryption failed - no handle returned");
      }
      onEncrypted?.(encrypted.handles[0].toString());
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <button
      {...buttonProps}
      onClick={handleEncrypt}
      disabled={!instance || isEncrypting}
      style={{
        opacity: !instance || isEncrypting ? 0.6 : 1,
        cursor: !instance || isEncrypting ? "not-allowed" : "pointer",
        ...buttonProps.style
      }}
    >
      {isEncrypting ? "Encrypting..." : children}
      {error && (
        <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>
          {error.message}
        </div>
      )}
    </button>
  );
}
