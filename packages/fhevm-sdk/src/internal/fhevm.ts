import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import { FHEVMError, FHEVMAbortError } from "../types.js";
import { logger } from "../utilities/index.js";

export type {
  FhevmInitSDKOptions,
  FhevmInitSDKType,
  FhevmLoadSDKType,
  FhevmWindowType,
} from "./fhevmTypes.js";

import { RelayerSDKLoader } from "./RelayerSDKLoader.js";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage.js";

export class FhevmReactError extends FHEVMError {
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message || "FHEVM React Error", code, options?.cause);
    this.name = "FhevmReactError";
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

const isFhevmInitialized = (): boolean => {
  // Check for both uppercase and lowercase versions
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
  if (!sdk) {
    return false;
  }
  return sdk.__initialized__ === true;
};

const fhevmLoadSDK = () => {
  const loader = new RelayerSDKLoader({ trace: logger.debug.bind(logger) });
  return loader.load();
};

const fhevmInitSDK = async (options?: any): Promise<boolean> => {
  // Check for both uppercase and lowercase versions
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
  if (!sdk) {
    throw new Error("window.relayerSDK or window.RelayerSDK is not available");
  }
  
  // Store in expected location for consistency
  (window as any).relayerSDK = sdk;
  
  try {
    const result = await sdk.initSDK(options);
    sdk.__initialized__ = result;
    if (!result) {
      throw new Error("window.relayerSDK.initSDK returned false.");
    }
    logger.info("FHEVM SDK initialized with CDN");
    return true;
  } catch (error) {
    // If initialization fails and no custom options were provided, try local fallback
    if (!options && error instanceof Error) {
      logger.warn("SDK initialization failed, trying local WASM files fallback", error.message);
      
      try {
        const localOptions = {
          tfheParams: "/tfhe_bg.wasm",
          kmsParams: "/kms_lib_bg.wasm"
        };
        logger.debug("Attempting to initialize with local WASM files", localOptions);
        
        const result = await sdk.initSDK(localOptions);
        sdk.__initialized__ = result;
        if (!result) {
          throw new Error("window.relayerSDK.initSDK with local files returned false.");
        }
        logger.info("Successfully initialized with local WASM files");
        return true;
      } catch (fallbackError) {
        logger.error("Local WASM fallback also failed", fallbackError);
        // Re-throw the original error, not the fallback error
        throw error;
      }
    }
    // If options were provided or it's not an Error, throw as-is
    throw error;
  }
};

function checkIsAddress(a: unknown): a is `0x${string}` {
  if (typeof a !== "string") {
    return false;
  }
  if (!isAddress(a)) {
    return false;
  }
  return true;
}

export class FhevmAbortError extends FHEVMAbortError {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType =
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating";

async function getChainId(
  providerOrUrl: Eip1193Provider | string
): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("web3_clientVersion", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "WEB3_CLIENTVERSION_ERROR",
      `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const version = await getWeb3Client(rpcUrl);
  if (
    typeof version !== "string" ||
    !version.toLowerCase().includes("hardhat")
  ) {
    // Not a Hardhat Node
    return undefined;
  }
  try {
    const metadata = await getFHEVMRelayerMetadata(rpcUrl);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    if (
      !(
        "ACLAddress" in metadata &&
        typeof metadata.ACLAddress === "string" &&
        metadata.ACLAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "InputVerifierAddress" in metadata &&
        typeof metadata.InputVerifierAddress === "string" &&
        metadata.InputVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "KMSVerifierAddress" in metadata &&
        typeof metadata.KMSVerifierAddress === "string" &&
        metadata.KMSVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    return metadata;
  } catch {
    // Not a FHEVM Hardhat Node
    return undefined;
  }
}

async function getFHEVMRelayerMetadata(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("fhevm_relayer_metadata", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "FHEVM_RELAYER_METADATA_ERROR",
      `The URL ${rpcUrl} is not a FHEVM Hardhat node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string | undefined };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl: string | undefined };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  // Resolve chainId
  const chainId = await getChainId(providerOrUrl);

  // Resolve rpc url
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;

  const _mockChains: Record<number, string> = {
    31337: "http://localhost:8545",
    ...(mockChains ?? {}),
  };

  // Help Typescript solver here:
  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }

    return { isMock: true, chainId, rpcUrl };
  }

  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  chainId: number;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const throwIfAborted = () => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (onStatusChange) onStatusChange(status);
  };

  const {
    signal,
    onStatusChange,
    provider: providerOrUrl,
    mockChains,
    chainId: providedChainId,
  } = parameters;

  // Resolve chainId
  const { isMock, rpcUrl } = await resolve(providerOrUrl, mockChains);

  if (isMock) {
    // Throws an error if cannot connect or url does not refer to a Web3 client
    if (!rpcUrl) {
      throw new Error("RPC URL is required for mock chains");
    }
    
    const fhevmRelayerMetadata =
      await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

    if (fhevmRelayerMetadata) {
      // fhevmRelayerMetadata is defined, which means rpcUrl refers to a FHEVM Hardhat Node
      notify("creating");

      //////////////////////////////////////////////////////////////////////////
      // 
      // WARNING!!
      // ALWAY USE DYNAMIC IMPORT TO AVOID INCLUDING THE ENTIRE FHEVM MOCK LIB 
      // IN THE FINAL PRODUCTION BUNDLE!!
      // 
      //////////////////////////////////////////////////////////////////////////
      const fhevmMock = await import("./mock/fhevmMock.js");
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl,
        chainId: providedChainId,
        metadata: fhevmRelayerMetadata,
      });

      throwIfAborted();

      return mockInstance;
    }
  }

  throwIfAborted();

  // Check for both uppercase and lowercase versions
  let relayerSDK = (window as any).RelayerSDK || (window as any).relayerSDK;
  
  if (!relayerSDK) {
    notify("sdk-loading");

    // throws an error if failed
    await fhevmLoadSDK();
    throwIfAborted();

    notify("sdk-loaded");
    
    // After loading, check again
    relayerSDK = (window as any).RelayerSDK || (window as any).relayerSDK;
    if (!relayerSDK) {
      throw new Error("RelayerSDK not found after loading from CDN");
    }
    // Store in expected location for consistency
    (window as any).relayerSDK = relayerSDK;
  }

  // notify that state === "sdk-loaded"

  if (!isFhevmInitialized()) {
    notify("sdk-initializing");

    // throws an error if failed
    await fhevmInitSDK();
    throwIfAborted();

    notify("sdk-initialized");
    
    // Refresh reference after initialization
    relayerSDK = (window as any).RelayerSDK || (window as any).relayerSDK;
  }

  // Use ZamaEthereumConfig (v0.9+) if available, otherwise fall back to SepoliaConfig (v0.8)
  const configBase = relayerSDK.ZamaEthereumConfig || relayerSDK.SepoliaConfig;
  if (!configBase) {
    throw new Error("Neither ZamaEthereumConfig nor SepoliaConfig found in relayerSDK");
  }

  const aclAddress = configBase.aclContractAddress;
  if (!checkIsAddress(aclAddress)) {
    throw new Error(`Invalid address: ${aclAddress}`);
  }

  const pub = await publicKeyStorageGet(aclAddress);
  throwIfAborted();

  const config: FhevmInstanceConfig = {
    ...configBase,
    network: providerOrUrl,
    publicKey: pub.publicKey,
    publicParams: pub.publicParams,
  };

  // notify that state === "creating"
  notify("creating");

  const instance = await relayerSDK.createInstance(config);

  // Save the key even if aborted
  await publicKeyStorageSet(
    aclAddress,
    instance.getPublicKey(),
    instance.getPublicParams(2048)
  );

  throwIfAborted();

  return instance;
};
