import { ref, computed, readonly } from "vue";
import { FHEVMEncryptionError } from "@fhevm/core";
/**
 * Vue composable for encryption functionality
 *
 * Provides reactive encryption state and methods using Vue 3 Composition API.
 */
export function useEncryption(instance, options) {
    // Reactive state
    const data = ref(null);
    const isEncrypting = ref(false);
    const error = ref(null);
    // Computed properties
    const hasData = computed(() => data.value !== null);
    const hasError = computed(() => error.value !== null);
    // Encrypt function
    const encrypt = async (value) => {
        if (!instance.value) {
            const err = new FHEVMEncryptionError("FHEVM instance not available");
            error.value = err;
            throw err;
        }
        isEncrypting.value = true;
        error.value = null;
        try {
            const input = instance.value.createEncryptedInput(options.contractAddress || "", options.publicKey);
            input.add32(value);
            const encrypted = await input.encrypt();
            if (!encrypted.handles[0]) {
                throw new FHEVMEncryptionError("Encryption failed - no handle returned");
            }
            const handle = encrypted.handles[0];
            const handleString = Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('');
            data.value = handleString;
            return handleString;
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            error.value = errorObj;
            throw errorObj;
        }
        finally {
            isEncrypting.value = false;
        }
    };
    // Reset function
    const reset = () => {
        data.value = null;
        error.value = null;
        isEncrypting.value = false;
    };
    return {
        // State
        data: readonly(data),
        isEncrypting: readonly(isEncrypting),
        error: readonly(error),
        hasData,
        hasError,
        // Actions
        encrypt,
        reset
    };
}
//# sourceMappingURL=useEncryption.js.map