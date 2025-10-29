import { useCallback, useEffect, useRef, useState } from "react";
import { createFHEVMClient } from "@fhevm/core";
/**
 * Main FHEVM hook - provides the core FHEVM client functionality
 *
 * This hook follows wagmi patterns and provides a simple, intuitive API
 * for React developers to interact with FHEVM.
 */
export function useFHEVM(config, events) {
    const [state, setState] = useState({
        status: "idle",
        instance: null,
        error: null,
        isInitialized: false
    });
    const clientRef = useRef(null);
    const [isInitializing, setIsInitializing] = useState(false);
    // Initialize the client
    const initialize = useCallback(async () => {
        if (isInitializing || state.isInitialized)
            return;
        setIsInitializing(true);
        try {
            if (!clientRef.current) {
                clientRef.current = createFHEVMClient(config, {
                    ...events,
                    onStatusChange: (status) => {
                        setState(prev => ({ ...prev, status }));
                        events?.onStatusChange?.(status);
                    },
                    onError: (error) => {
                        setState(prev => ({ ...prev, error, status: "error" }));
                        events?.onError?.(error);
                    },
                    onReady: (instance) => {
                        setState(prev => ({ ...prev, instance, status: "ready", isInitialized: true }));
                        events?.onReady?.(instance);
                    }
                });
            }
            await clientRef.current.initialize();
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error(String(error)),
                status: "error"
            }));
        }
        finally {
            setIsInitializing(false);
        }
    }, [config, events, isInitializing, state.isInitialized]);
    // Auto-initialize on mount
    useEffect(() => {
        initialize();
    }, [initialize]);
    // Refresh function
    const refresh = useCallback(async () => {
        if (clientRef.current) {
            await clientRef.current.refresh();
        }
        else {
            await initialize();
        }
    }, [initialize]);
    // Destroy function
    const destroy = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.destroy();
            clientRef.current = null;
            setState({
                status: "idle",
                instance: null,
                error: null,
                isInitialized: false
            });
        }
    }, []);
    return {
        // State
        ...state,
        isInitializing,
        // Actions
        initialize,
        refresh,
        destroy,
        // Client instance (for advanced usage)
        client: clientRef.current
    };
}
//# sourceMappingURL=useFHEVM.js.map