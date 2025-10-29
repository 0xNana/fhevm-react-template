import { type Ref } from 'vue';
import type { FhevmInstance } from '@fhevm/core';
/**
 * Vue composable for FHEVM EIP-712 signature generation
 *
 * Provides reactive signature generation for FHEVM write functions.
 */
export declare function useFHEVMSignature(instance: Ref<FhevmInstance | null>, userAddress: Ref<string | undefined>): {
    signature: import("vue").ComputedRef<string | null>;
    isSigning: import("vue").ComputedRef<boolean>;
    error: import("vue").ComputedRef<Error | null>;
    hasSignature: import("vue").ComputedRef<boolean>;
    hasError: import("vue").ComputedRef<boolean>;
    generateSignature: (_contractAddress: string) => Promise<string>;
    reset: () => void;
};
//# sourceMappingURL=useFHEVMSignature.d.ts.map