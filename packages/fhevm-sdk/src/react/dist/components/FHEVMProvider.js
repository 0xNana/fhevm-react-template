import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useFHEVM } from "../hooks/useFHEVM.js";
const FHEVMContext = createContext(null);
/**
 * FHEVM Provider component
 *
 * Provides FHEVM context to all child components. This is the main
 * way to initialize FHEVM in a React application.
 */
export function FHEVMProvider({ children, config, events }) {
    const fhevm = useFHEVM(config, events);
    return (_jsx(FHEVMContext.Provider, { value: fhevm, children: children }));
}
/**
 * Hook to access FHEVM context
 *
 * Must be used within a FHEVMProvider.
 */
export function useFHEVMContext() {
    const context = useContext(FHEVMContext);
    if (!context) {
        throw new Error("useFHEVMContext must be used within a FHEVMProvider");
    }
    return context;
}
//# sourceMappingURL=FHEVMProvider.js.map