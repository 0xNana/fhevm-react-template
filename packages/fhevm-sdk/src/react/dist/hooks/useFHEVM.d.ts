import { type FHEVMConfig, type FHEVMEvents } from "@fhevm/core";
/**
 * Main FHEVM hook - provides the core FHEVM client functionality
 *
 * This hook follows wagmi patterns and provides a simple, intuitive API
 * for React developers to interact with FHEVM.
 */
export declare function useFHEVM(config: FHEVMConfig, events?: FHEVMEvents): {
    isInitializing: boolean;
    initialize: () => Promise<void>;
    refresh: () => Promise<void>;
    destroy: () => void;
    client: import("@fhevm/core").FHEVMClient | null;
    status: import("@fhevm/core").FHEVMStatus;
    instance: import("@fhevm/core").FhevmInstance | null;
    error: Error | null;
    isInitialized: boolean;
};
//# sourceMappingURL=useFHEVM.d.ts.map