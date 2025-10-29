import React, { type ReactNode } from "react";
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
export declare function EncryptButton({ value, publicKey, contractAddress: _contractAddress, onEncrypted, onError, children, buttonProps }: EncryptButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EncryptButton.d.ts.map