import { type Ref } from "vue";
import type { FhevmInstance } from "@fhevm/core";
export interface UseEncryptionOptions {
    /** Public key for encryption */
    publicKey: string;
    /** Contract address (optional) */
    contractAddress?: string;
    /** Additional parameters */
    params?: Record<string, any>;
}
/**
 * Vue composable for encryption functionality
 *
 * Provides reactive encryption state and methods using Vue 3 Composition API.
 */
export declare function useEncryption(instance: Ref<FhevmInstance | null>, options: UseEncryptionOptions): {
    data: Readonly<Ref<string | null, string | null>>;
    isEncrypting: Readonly<Ref<boolean, boolean>>;
    error: Readonly<Ref<Error | null, Error | null>>;
    hasData: import("vue").ComputedRef<boolean>;
    hasError: import("vue").ComputedRef<boolean>;
    encrypt: (value: number) => Promise<string>;
    reset: () => void;
};
//# sourceMappingURL=useEncryption.d.ts.map