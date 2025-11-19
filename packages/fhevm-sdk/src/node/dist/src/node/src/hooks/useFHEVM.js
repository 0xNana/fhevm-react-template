import { createFHEVMClient } from '../../../client.js';
/**
 * Core FHEVM hook for Node.js
 *
 * Provides a React-like hook interface for FHEVM operations in Node.js.
 * This is the foundation for all other hooks.
 */
export function useFHEVM(config) {
    let client = null;
    let isReady = false;
    let isLoading = false;
    let error = null;
    const initialize = async () => {
        if (isLoading || isReady)
            return;
        isLoading = true;
        error = null;
        try {
            const events = {
                onStatusChange: (status) => {
                    console.log(`[FHEVM Hook] Status: ${status}`);
                },
                onError: (err) => {
                    error = err;
                    console.error(`[FHEVM Hook] Error: ${err.message}`);
                },
                onReady: (_instance) => {
                    isReady = true;
                    isLoading = false;
                    console.log('[FHEVM Hook] Client is ready!');
                }
            };
            client = createFHEVMClient(config, events);
            await client.initialize();
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            isLoading = false;
            throw error;
        }
    };
    const reset = () => {
        client = null;
        isReady = false;
        isLoading = false;
        error = null;
    };
    // Auto-initialize if enabled
    if (config.autoInit !== false) {
        initialize().catch(console.error);
    }
    return {
        client,
        isReady,
        isLoading,
        error,
        initialize,
        reset
    };
}
//# sourceMappingURL=useFHEVM.js.map