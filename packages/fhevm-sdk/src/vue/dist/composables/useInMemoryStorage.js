import { ref, computed } from 'vue';
import { createInMemoryStorage } from '@fhevm/core';
/**
 * Vue composable for in-memory storage
 *
 * Provides reactive in-memory storage functionality using Vue 3 Composition API.
 */
export function useInMemoryStorage() {
    const storage = ref(createInMemoryStorage());
    // Storage methods
    const get = async (key) => {
        return await storage.value.get(key);
    };
    const set = async (key, value) => {
        await storage.value.set(key, value);
    };
    const remove = async (key) => {
        await storage.value.remove(key);
    };
    const clear = async () => {
        await storage.value.clear();
    };
    return {
        // Storage instance
        storage: computed(() => storage.value),
        // Methods
        get,
        set,
        remove,
        clear
    };
}
//# sourceMappingURL=useInMemoryStorage.js.map