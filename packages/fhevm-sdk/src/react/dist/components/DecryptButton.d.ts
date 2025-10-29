import React, { type ReactNode } from "react";
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
export declare function DecryptButton({ handle, contractAddress: _contractAddress, signature, usePublicDecrypt, onDecrypted, onError, children, buttonProps }: DecryptButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DecryptButton.d.ts.map