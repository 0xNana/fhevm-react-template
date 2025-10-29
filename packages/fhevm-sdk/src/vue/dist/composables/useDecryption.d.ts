import { type Ref } from "vue";
import type { FhevmInstance } from "@fhevm/core";
export interface UseDecryptionOptions {
    /** Encrypted handle to decrypt */
    handle: string;
    /** Contract address */
    contractAddress: string;
    /** User signature for userDecrypt */
    signature?: string;
    /** Use public decryption (no signature required) */
    usePublicDecrypt?: boolean;
}
/**
 * Vue composable for decryption functionality
 *
 * Provides reactive decryption state and methods using Vue 3 Composition API.
 */
export declare function useDecryption(instance: Ref<FhevmInstance | null>, options: UseDecryptionOptions): {
    data: Readonly<Ref<number | null, number | null>>;
    isDecrypting: Readonly<Ref<boolean, boolean>>;
    error: Readonly<Ref<Error | null, Error | null>>;
    hasData: import("vue").ComputedRef<boolean>;
    hasError: import("vue").ComputedRef<boolean>;
    decrypt: () => Promise<number>;
    reset: () => void;
};
//# sourceMappingURL=useDecryption.d.ts.map