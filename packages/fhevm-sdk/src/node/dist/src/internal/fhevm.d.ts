import { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import { FHEVMError, FHEVMAbortError } from "../types.js";
export type { FhevmInitSDKOptions, FhevmInitSDKType, FhevmLoadSDKType, FhevmWindowType, } from "./fhevmTypes.js";
export declare class FhevmReactError extends FHEVMError {
    constructor(code: string, message?: string, options?: ErrorOptions);
}
export declare class FhevmAbortError extends FHEVMAbortError {
    constructor(message?: string);
}
type FhevmRelayerStatusType = "sdk-loading" | "sdk-loaded" | "sdk-initializing" | "sdk-initialized" | "creating";
export declare const createFhevmInstance: (parameters: {
    provider: Eip1193Provider | string;
    chainId: number;
    mockChains?: Record<number, string>;
    signal: AbortSignal;
    onStatusChange?: (status: FhevmRelayerStatusType) => void;
}) => Promise<FhevmInstance>;
//# sourceMappingURL=fhevm.d.ts.map