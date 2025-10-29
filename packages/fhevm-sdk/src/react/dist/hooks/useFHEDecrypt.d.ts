import { GenericStringStorage } from "@fhevm/core";
import { FhevmInstance } from "@fhevm/core";
import { ethers } from "ethers";
export type FHEDecryptRequest = {
    handle: string;
    contractAddress: `0x${string}`;
};
export declare const useFHEDecrypt: (params: {
    instance: FhevmInstance | undefined;
    ethersSigner: ethers.JsonRpcSigner | undefined;
    fhevmDecryptionSignatureStorage: GenericStringStorage;
    chainId: number | undefined;
    requests: readonly FHEDecryptRequest[] | undefined;
}) => {
    readonly canDecrypt: boolean;
    readonly decrypt: () => void;
    readonly isDecrypting: boolean;
    readonly message: string;
    readonly results: Record<string, string | bigint | boolean>;
    readonly error: string | null;
    readonly setMessage: import("react").Dispatch<import("react").SetStateAction<string>>;
    readonly setError: import("react").Dispatch<import("react").SetStateAction<string | null>>;
};
//# sourceMappingURL=useFHEDecrypt.d.ts.map