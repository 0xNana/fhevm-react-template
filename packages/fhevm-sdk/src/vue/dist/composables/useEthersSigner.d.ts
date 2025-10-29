import { type Ref } from 'vue';
export interface UseEthersSignerOptions {
    address?: Ref<string | undefined>;
    isConnected?: Ref<boolean>;
    chainId?: Ref<number | undefined>;
    walletClient?: Ref<any>;
}
/**
 * Vue composable for getting ethers signer
 * Can work with or without @wagmi/vue
 */
export declare function useEthersSigner(options?: UseEthersSignerOptions): {
    ethersSigner: Ref<undefined, undefined>;
    ethersProvider: Ref<undefined, undefined>;
    chainId: Ref<undefined, undefined>;
    isConnected: Ref<boolean, boolean>;
    address: Ref<undefined, undefined>;
} | {
    ethersSigner: import("vue").ComputedRef<any>;
    ethersProvider: import("vue").ComputedRef<any>;
    chainId: Ref<number | undefined, number | undefined>;
    isConnected: Ref<boolean, boolean>;
    address: Ref<string | undefined, string | undefined>;
};
//# sourceMappingURL=useEthersSigner.d.ts.map