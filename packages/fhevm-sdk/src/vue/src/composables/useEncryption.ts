import { ref, computed, readonly, type Ref } from "vue";
import type { FhevmInstance } from "../../../index.js";
import { FHEVMEncryptionError } from "../../../index.js";

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
export function useEncryption(
  instance: Ref<FhevmInstance | null>,
  options: UseEncryptionOptions
) {
  // Reactive state
  const data = ref<string | null>(null);
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);

  // Computed properties
  const hasData = computed(() => data.value !== null);
  const hasError = computed(() => error.value !== null);

  // Encrypt function
  const encrypt = async (value: number): Promise<string> => {
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
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;
      throw errorObj;
    } finally {
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
