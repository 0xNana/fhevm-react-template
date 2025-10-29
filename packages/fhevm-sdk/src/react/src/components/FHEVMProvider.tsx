import { createContext, useContext, type ReactNode } from "react";
import { useFHEVM } from "../hooks/useFHEVM.js";
import type { FHEVMState, FHEVMConfig, FHEVMEvents } from "../../../index.js";

interface FHEVMContextValue extends FHEVMState {
  isInitializing: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  destroy: () => void;
}

const FHEVMContext = createContext<FHEVMContextValue | null>(null);

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
export function FHEVMProvider({ children, config, events }: FHEVMProviderProps) {
  const fhevm = useFHEVM(config, events);

  return (
    <FHEVMContext.Provider value={fhevm}>
      {children}
    </FHEVMContext.Provider>
  );
}

/**
 * Hook to access FHEVM context
 * 
 * Must be used within a FHEVMProvider.
 */
export function useFHEVMContext(): FHEVMContextValue {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error("useFHEVMContext must be used within a FHEVMProvider");
  }
  return context;
}
