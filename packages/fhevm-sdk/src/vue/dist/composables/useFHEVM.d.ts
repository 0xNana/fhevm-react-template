import { type FHEVMConfig, type FHEVMEvents, type FHEVMState } from "@fhevm/core";
/**
 * Vue composable for FHEVM functionality
 *
 * Provides reactive FHEVM client state and methods using Vue 3 Composition API.
 */
export declare function useFHEVM(config: FHEVMConfig, events?: FHEVMEvents): {
    state: Readonly<import("vue").Ref<{
        readonly status: import("@fhevm/core").FHEVMStatus;
        readonly instance: {
            readonly createEncryptedInput: (contractAddress: string, userAddress: string) => import("@zama-fhe/relayer-sdk/web").RelayerEncryptedInput;
            readonly generateKeypair: () => {
                publicKey: string;
                privateKey: string;
            };
            readonly createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number) => import("@zama-fhe/relayer-sdk/web").EIP712;
            readonly publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<import("@zama-fhe/relayer-sdk/web").DecryptedResults>;
            readonly userDecrypt: (handles: import("@zama-fhe/relayer-sdk/web").HandleContractPair[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: string | number, durationDays: string | number) => Promise<import("@zama-fhe/relayer-sdk/web").DecryptedResults>;
            readonly getPublicKey: () => {
                publicKeyId: string;
                publicKey: Uint8Array;
            } | null;
            readonly getPublicParams: (bits: keyof import("@zama-fhe/relayer-sdk/web").PublicParams) => {
                publicParams: Uint8Array;
                publicParamsId: string;
            } | null;
        } | null;
        readonly error: Error | null;
        readonly isInitialized: boolean;
    }, {
        readonly status: import("@fhevm/core").FHEVMStatus;
        readonly instance: {
            readonly createEncryptedInput: (contractAddress: string, userAddress: string) => import("@zama-fhe/relayer-sdk/web").RelayerEncryptedInput;
            readonly generateKeypair: () => {
                publicKey: string;
                privateKey: string;
            };
            readonly createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number) => import("@zama-fhe/relayer-sdk/web").EIP712;
            readonly publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<import("@zama-fhe/relayer-sdk/web").DecryptedResults>;
            readonly userDecrypt: (handles: import("@zama-fhe/relayer-sdk/web").HandleContractPair[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: string | number, durationDays: string | number) => Promise<import("@zama-fhe/relayer-sdk/web").DecryptedResults>;
            readonly getPublicKey: () => {
                publicKeyId: string;
                publicKey: Uint8Array;
            } | null;
            readonly getPublicParams: (bits: keyof import("@zama-fhe/relayer-sdk/web").PublicParams) => {
                publicParams: Uint8Array;
                publicParamsId: string;
            } | null;
        } | null;
        readonly error: Error | null;
        readonly isInitialized: boolean;
    }>>;
    isInitializing: Readonly<import("vue").Ref<boolean, boolean>>;
    isReady: import("vue").ComputedRef<boolean>;
    hasError: import("vue").ComputedRef<boolean>;
    initialize: () => Promise<void>;
    refresh: () => Promise<void>;
    destroy: () => void;
    client: Readonly<import("vue").Ref<{
        readonly initialize: () => Promise<void>;
        readonly encrypt: (value: number, options: import("@fhevm/core").EncryptionOptions) => Promise<string>;
        readonly decrypt: (options: import("@fhevm/core").DecryptionOptions) => Promise<number>;
        readonly getState: () => FHEVMState;
        readonly getInstance: () => import("@zama-fhe/relayer-sdk/web").FhevmInstance | null;
        readonly isReady: () => boolean;
        readonly getStatus: () => import("@fhevm/core").FHEVMStatus;
        readonly getError: () => Error | null;
        readonly refresh: () => Promise<void>;
        readonly destroy: () => void;
    } | null, {
        readonly initialize: () => Promise<void>;
        readonly encrypt: (value: number, options: import("@fhevm/core").EncryptionOptions) => Promise<string>;
        readonly decrypt: (options: import("@fhevm/core").DecryptionOptions) => Promise<number>;
        readonly getState: () => FHEVMState;
        readonly getInstance: () => import("@zama-fhe/relayer-sdk/web").FhevmInstance | null;
        readonly isReady: () => boolean;
        readonly getStatus: () => import("@fhevm/core").FHEVMStatus;
        readonly getError: () => Error | null;
        readonly refresh: () => Promise<void>;
        readonly destroy: () => void;
    } | null>>;
};
//# sourceMappingURL=useFHEVM.d.ts.map