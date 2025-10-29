import { ref, computed, readonly, onMounted, onUnmounted } from "vue";
import { createFHEVMClient, type FHEVMConfig, type FHEVMEvents, type FHEVMState } from "../../../index.js";

/**
 * Vue composable for FHEVM functionality
 * 
 * Provides reactive FHEVM client state and methods using Vue 3 Composition API.
 */
export function useFHEVM(config: FHEVMConfig, events?: FHEVMEvents) {
  // Reactive state
  const state = ref<FHEVMState>({
    status: "idle",
    instance: null,
    error: null,
    isInitialized: false
  });

  const isInitializing = ref(false);
  const client = ref<ReturnType<typeof createFHEVMClient> | null>(null);

  // Computed properties
  const isReady = computed(() => state.value.status === "ready" && state.value.instance !== null);
  const hasError = computed(() => state.value.error !== null);

  // Initialize the client
  const initialize = async () => {
    if (isInitializing.value || state.value.isInitialized) return;

    isInitializing.value = true;
    try {
      if (!client.value) {
        client.value = createFHEVMClient(config, {
          ...events,
          onStatusChange: (status) => {
            state.value = { ...state.value, status };
            events?.onStatusChange?.(status);
          },
          onError: (error) => {
            state.value = { ...state.value, error, status: "error" };
            events?.onError?.(error);
          },
          onReady: (instance) => {
            state.value = { ...state.value, instance, status: "ready", isInitialized: true };
            events?.onReady?.(instance);
          }
        });
      }

      await client.value.initialize();
    } catch (error) {
      state.value = {
        ...state.value,
        error: error instanceof Error ? error : new Error(String(error)),
        status: "error"
      };
    } finally {
      isInitializing.value = false;
    }
  };

  // Refresh function
  const refresh = async () => {
    if (client.value) {
      await client.value.refresh();
    } else {
      await initialize();
    }
  };

  // Destroy function
  const destroy = () => {
    if (client.value) {
      client.value.destroy();
      client.value = null;
      state.value = {
        status: "idle",
        instance: null,
        error: null,
        isInitialized: false
      };
    }
  };

  // Auto-initialize on mount
  onMounted(() => {
    initialize();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    destroy();
  });

  return {
    // State
    state: readonly(state),
    isInitializing: readonly(isInitializing),
    isReady,
    hasError,
    
    // Actions
    initialize,
    refresh,
    destroy,
    
    // Client instance (for advanced usage)
    client: readonly(client)
  };
}
