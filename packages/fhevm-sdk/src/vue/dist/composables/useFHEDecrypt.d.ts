import { type Ref } from 'vue';
import type { FhevmInstance } from '@fhevm/core';
export interface FHEDecryptRequest {
    handle: string;
    contractAddress: `0x${string}`;
}
/**
 * Vue composable for FHEVM decryption
 *
 * Provides reactive FHEVM decryption functionality using Vue 3 Composition API.
 */
export declare function useFHEDecrypt(params: {
    instance: Ref<FhevmInstance | null>;
    ethersSigner: Ref<any>;
    fhevmDecryptionSignatureStorage: any;
    requests: Ref<readonly FHEDecryptRequest[] | undefined>;
}): {
    readonly canDecrypt: import("vue").ComputedRef<boolean>;
    readonly decrypt: () => Promise<void>;
    readonly isDecrypting: Ref<boolean, boolean>;
    readonly message: Ref<string, string>;
    readonly results: Ref<Record<string, string | bigint | boolean>, Record<string, string | bigint | boolean>>;
    readonly error: Ref<string | null, string | null>;
    readonly setMessage: (msg: string) => void;
    readonly setError: (err: string | null) => void;
    readonly resetDecryptionState: () => void;
};
//# sourceMappingURL=useFHEDecrypt.d.ts.map