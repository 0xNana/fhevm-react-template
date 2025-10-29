import { ref, computed } from 'vue'
import { createInMemoryStorage } from "../../../index.js"

/**
 * Vue composable for in-memory storage
 * 
 * Provides reactive in-memory storage functionality using Vue 3 Composition API.
 */
export function useInMemoryStorage() {
  const storage = ref(createInMemoryStorage())

  // Storage methods
  const get = async (key: string): Promise<string | null> => {
    return await storage.value.get(key)
  }

  const set = async (key: string, value: string): Promise<void> => {
    await storage.value.set(key, value)
  }

  const remove = async (key: string): Promise<void> => {
    await storage.value.remove(key)
  }

  const clear = async (): Promise<void> => {
    await storage.value.clear()
  }

  return {
    // Storage instance
    storage: computed(() => storage.value),
    
    // Methods
    get,
    set,
    remove,
    clear
  }
}
