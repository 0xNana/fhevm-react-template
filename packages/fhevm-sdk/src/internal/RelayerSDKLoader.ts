import { FhevmRelayerSDKType, FhevmWindowType } from "./fhevmTypes.js";
import { SDK_CDN_URL } from "./constants.js";
import { logger } from "../utilities/index.js";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType }) {
    if (options.trace !== undefined) {
      this._trace = options.trace;
    }
  }

  public isLoaded() {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    logger.debug("RelayerSDKLoader: loading SDK");
    // Ensure this only runs in the browser
    if (typeof window === "undefined") {
      logger.debug("RelayerSDKLoader: window is undefined");
      return Promise.reject(
        new Error("RelayerSDKLoader: can only be used in the browser.")
      );
    }

    // Check for both uppercase and lowercase versions (CDN may expose either)
    const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
    if (sdk) {
      if (!isFhevmRelayerSDKType(sdk, this._trace)) {
        logger.warn("RelayerSDKLoader: SDK found but validation failed", { availableProperties: Object.keys(sdk || {}) });
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK - validation failed");
      }
      // Store it in the expected location for consistency
      (window as any).relayerSDK = sdk;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${SDK_CDN_URL}"]`
      );
      if (existingScript) {
        // If script exists, check if SDK is already loaded
        const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
        if (sdk && isFhevmRelayerSDKType(sdk, this._trace)) {
          // SDK is ready, store it in expected location
          (window as any).relayerSDK = sdk;
          resolve();
          return;
        }
        
        // Script tag exists but hasn't loaded yet - wait for it
        let resolved = false;
        let checkInterval: ReturnType<typeof setInterval> | null = null;
        
        const cleanup = () => {
          if (checkInterval) clearInterval(checkInterval);
          checkInterval = null;
        };
        
        const checkAndResolve = () => {
          if (resolved) return;
          // Check for both uppercase and lowercase versions
          const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
          if (sdk && isFhevmRelayerSDKType(sdk, this._trace)) {
            // Store it in the expected location for consistency
            (window as any).relayerSDK = sdk;
            resolved = true;
            cleanup();
            resolve();
          }
        };
        
        checkInterval = setInterval(checkAndResolve, 50);
        
        // Also listen for load and error events
        existingScript.addEventListener('load', () => {
          checkAndResolve();
          if (!resolved) {
            const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
            if (!sdk || !isFhevmRelayerSDKType(sdk, this._trace)) {
              resolved = true;
              cleanup();
              reject(
                new Error(
                  "RelayerSDKLoader: window object does not contain a valid relayerSDK or RelayerSDK object."
                )
              );
            }
          }
        });
        
        existingScript.addEventListener('error', () => {
          if (!resolved) {
            resolved = true;
            cleanup();
            reject(
              new Error(
                `RelayerSDKLoader: Failed to load SDK script from existing script tag.`
              )
            );
          }
        });
        
        // Timeout after 5 seconds (reduced from 10)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
            if (!sdk || !isFhevmRelayerSDKType(sdk, this._trace)) {
              reject(
                new Error(
                  "RelayerSDKLoader: Timeout waiting for SDK script to load. This might be a network issue or the CDN might be blocked. Try copying WASM files locally using 'pnpm run copy-wasm'."
                )
              );
            }
          }
        }, 5000);
        
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        // Check for both uppercase and lowercase versions
        const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
        if (!sdk || !isFhevmRelayerSDKType(sdk, this._trace)) {
          logger.error("RelayerSDKLoader: script loaded but SDK validation failed", {
            hasRelayerSDK: "relayerSDK" in window,
            hasRelayerSDKUppercase: "RelayerSDK" in window,
            windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes("relayer"))
          });
          reject(
            new Error(
              `RelayerSDKLoader: Relayer SDK script has been successfully loaded from ${SDK_CDN_URL}, however, the window.relayerSDK or window.RelayerSDK object is invalid.`
            )
          );
        }
        // Store it in the expected location for consistency
        (window as any).relayerSDK = sdk;
        logger.debug("RelayerSDKLoader: SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        logger.error(`RelayerSDKLoader: Failed to load SDK from ${SDK_CDN_URL}`);
        reject(
          new Error(
            `RelayerSDKLoader: Failed to load Relayer SDK from ${SDK_CDN_URL}`
          )
        );
      };

      logger.debug("RelayerSDKLoader: Adding script to DOM", { url: SDK_CDN_URL });
      document.head.appendChild(script);
    });
  }
}

function isFhevmRelayerSDKType(
  o: unknown,
  trace?: TraceType
): o is FhevmRelayerSDKType {
  if (typeof o === "undefined") {
    trace?.("RelayerSDKLoader: relayerSDK is undefined");
    return false;
  }
  if (o === null) {
    trace?.("RelayerSDKLoader: relayerSDK is null");
    return false;
  }
  if (typeof o !== "object") {
    trace?.("RelayerSDKLoader: relayerSDK is not an object");
    return false;
  }
  if (!objHasProperty(o, "initSDK", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.initSDK is invalid");
    return false;
  }
  if (!objHasProperty(o, "createInstance", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.createInstance is invalid");
    return false;
  }
  // Check for either ZamaEthereumConfig (v0.9+) or SepoliaConfig (v0.8, backward compat)
  // Check SepoliaConfig first (what CDN v0.3.0-5 has) to avoid noisy warnings
  const hasSepoliaConfig = objHasProperty(o, "SepoliaConfig", "object", undefined); // Don't trace for optional check
  const hasZamaConfig = objHasProperty(o, "ZamaEthereumConfig", "object", undefined); // Don't trace for optional check
  if (!hasZamaConfig && !hasSepoliaConfig) {
    trace?.("RelayerSDKLoader: relayerSDK must have either ZamaEthereumConfig or SepoliaConfig");
    return false;
  }
  if ("__initialized__" in o) {
    if (o.__initialized__ !== true && o.__initialized__ !== false) {
      trace?.("RelayerSDKLoader: relayerSDK.__initialized__ is invalid");
      return false;
    }
  }
  return true;
}

export function isFhevmWindowType(
  win: unknown,
  trace?: TraceType
): win is FhevmWindowType {
  if (typeof win === "undefined") {
    trace?.("RelayerSDKLoader: window object is undefined");
    return false;
  }
  if (win === null) {
    trace?.("RelayerSDKLoader: window object is null");
    return false;
  }
  if (typeof win !== "object") {
    trace?.("RelayerSDKLoader: window is not an object");
    return false;
  }
  if (!("relayerSDK" in win)) {
    trace?.("RelayerSDKLoader: window does not contain 'relayerSDK' property");
    return false;
  }
  return isFhevmRelayerSDKType(win.relayerSDK);
}

function objHasProperty<
  T extends object,
  K extends PropertyKey,
  V extends string // "string", "number", etc.
>(
  obj: T,
  propertyName: K,
  propertyType: V,
  trace?: TraceType
): obj is T &
  Record<
    K,
    V extends "string"
      ? string
      : V extends "number"
      ? number
      : V extends "object"
      ? object
      : V extends "boolean"
      ? boolean
      : V extends "function"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]) => any
      : unknown
  > {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!(propertyName in obj)) {
    trace?.(`RelayerSDKLoader: missing ${String(propertyName)}.`);
    return false;
  }

  const value = (obj as Record<K, unknown>)[propertyName];

  if (value === null || value === undefined) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is null or undefined.`);
    return false;
  }

  if (typeof value !== propertyType) {
    trace?.(
      `RelayerSDKLoader: ${String(propertyName)} is not a ${propertyType}.`
    );
    return false;
  }

  return true;
}
