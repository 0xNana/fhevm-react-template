/**
 * Vue composable for in-memory storage
 *
 * Provides reactive in-memory storage functionality using Vue 3 Composition API.
 */
export declare function useInMemoryStorage(): {
    storage: import("vue").ComputedRef<{
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<void>;
        remove: (key: string) => Promise<void>;
        clear: () => Promise<void>;
    }>;
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
    clear: () => Promise<void>;
};
//# sourceMappingURL=useInMemoryStorage.d.ts.map