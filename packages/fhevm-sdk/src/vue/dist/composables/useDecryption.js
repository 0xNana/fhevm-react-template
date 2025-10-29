import { ref, computed, readonly } from "vue";
import { FHEVMDecryptionError } from "@fhevm/core";
/**
 * Vue composable for decryption functionality
 *
 * Provides reactive decryption state and methods using Vue 3 Composition API.
 */
export function useDecryption(instance, options) {
    // Reactive state
    const data = ref(null);
    const isDecrypting = ref(false);
    const error = ref(null);
    // Computed properties
    const hasData = computed(() => data.value !== null);
    const hasError = computed(() => error.value !== null);
    // Decrypt function
    const decrypt = async () => {
        if (!instance.value) {
            const err = new FHEVMDecryptionError("FHEVM instance not available");
            error.value = err;
            throw err;
        }
        isDecrypting.value = true;
        error.value = null;
        try {
            let decrypted;
            if (options.usePublicDecrypt) {
                // Use public decryption (no signature required)
                decrypted = Number(await instance.value.publicDecrypt([options.handle]));
            }
            else if (options.signature) {
                // Use user decryption with signature
                decrypted = Number(await instance.value.userDecrypt([{ handle: options.handle, contractAddress: options.contractAddress }], '', // privateKey
                '', // publicKey
                options.signature, [options.contractAddress], '', // userAddress
                0, // startTimestamp
                0 // durationDays
                ));
            }
            else {
                throw new FHEVMDecryptionError("Either signature or usePublicDecrypt must be provided");
            }
            data.value = decrypted;
            return decrypted;
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            error.value = errorObj;
            throw errorObj;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    // Reset function
    const reset = () => {
        data.value = null;
        error.value = null;
        isDecrypting.value = false;
    };
    return {
        // State
        data: readonly(data),
        isDecrypting: readonly(isDecrypting),
        error: readonly(error),
        hasData,
        hasError,
        // Actions
        decrypt,
        reset
    };
}
//# sourceMappingURL=useDecryption.js.map