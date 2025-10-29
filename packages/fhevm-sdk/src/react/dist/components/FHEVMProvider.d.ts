import { type ReactNode } from "react";
import type { FHEVMState, FHEVMConfig, FHEVMEvents } from "@fhevm/core";
interface FHEVMContextValue extends FHEVMState {
    isInitializing: boolean;
    initialize: () => Promise<void>;
    refresh: () => Promise<void>;
    destroy: () => void;
}
export interface FHEVMProviderProps {
    children: ReactNode;
    config: FHEVMConfig;
    events?: FHEVMEvents;
}
/**
 * FHEVM Provider component
 *
 * Provides FHEVM context to all child components. This is the main
 * way to initialize FHEVM in a React application.
 */
export declare function FHEVMProvider({ children, config, events }: FHEVMProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access FHEVM context
 *
 * Must be used within a FHEVMProvider.
 */
export declare function useFHEVMContext(): FHEVMContextValue;
export {};
//# sourceMappingURL=FHEVMProvider.d.ts.map