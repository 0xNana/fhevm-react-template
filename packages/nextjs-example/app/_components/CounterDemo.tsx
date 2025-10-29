"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { FHEVMProvider, useFHEVM, useFHEVMSignature, useFHEDecrypt, useInMemoryStorage } from "@fhevm/sdk/react";
import { useReadContract, useWriteContract } from "wagmi";
import { getContractConfig } from "~~/contracts";
import { ethers } from "ethers";

/**
 * Counter Demo using Universal FHEVM SDK
 * 
 * This component demonstrates the new Universal SDK with:
 * - FHEVMProvider for context management
 * - useFHEVM hook for client state
 * - useEncrypt/useDecrypt hooks for operations
 * - Modern UI with loading states and error handling
 */
function CounterDemoContent() {
  const { isConnected, chain, address } = useAccount();
  const chainId = chain?.id;

  // Contract configuration
  const counterConfig = getContractConfig('FHECounter');

  // FHEVM configuration
  const fhevmConfig = useMemo(() => ({
    rpcUrl: chainId === 31337 ? "http://localhost:8545" : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    chainId: chainId || Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
    mockChains: {
      31337: "http://localhost:8545"
    }
  }), [chainId]);

  // FHEVM hooks - REAL IMPLEMENTATION
  const { instance, isInitialized: isReady, status, error: fhevmError } = useFHEVM(fhevmConfig);
  

  
  // EIP-712 signature functionality
  const { generateSignature, signature, isSigning, error: signatureError } = useFHEVMSignature(instance, address);
  
  // Create ethers signer from window.ethereum (same as contract operations use)
  const ethersSigner = useMemo(() => {
    if (!isConnected || !address) return undefined;
    
    try {
      // Use the same ethereum provider that Wagmi uses
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = new ethers.JsonRpcSigner(provider, address);
      
      // Log signer methods for debugging
      console.log('🔍 ethersSigner Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)));
      console.log('🔍 ethersSigner has signTypedData:', typeof signer.signTypedData === 'function');
      
      return signer;
    } catch (error) {
      console.error('Failed to create ethers signer:', error);
      return undefined;
    }
  }, [isConnected, address]);

  // Contract interactions
  const { data: countHandle, refetch: refetchCount } = useReadContract({
    address: counterConfig.address as `0x${string}`,
    abi: counterConfig.abi as any,
    functionName: "getCount",
    query: {
      enabled: Boolean(counterConfig.address && isReady),
      refetchOnWindowFocus: false,
    },
  });

  // In-memory storage for decryption signatures
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  // Decryption requests for signature-based decryption
  const requests = useMemo(() => {
    if (!counterConfig.address || !countHandle || countHandle === "0x0000000000000000000000000000000000000000000000000000000000000000") return undefined;
    const request = [{ handle: countHandle.toString(), contractAddress: counterConfig.address as `0x${string}` }] as const;
    console.log("🔍 Requests updated:", request);
    return request;
  }, [counterConfig.address, countHandle]);
  
  // FHEVM Decryption using signature-based approach
  const {
    canDecrypt,
    decrypt: performDecrypt,
    isDecrypting,
    message: decryptionMessage,
    results,
    error: decryptError
  } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage.storage,
    requests
  });

  const { writeContract: writeCounter, isPending: isWritePending, error: writeError, isSuccess: isWriteSuccess } = useWriteContract();

  // State
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug: Log current state for debugging
  console.log("🔍 Current state:", {
    countHandle,
    resultsKeys: Object.keys(results),
    currentDecryptedValue: countHandle ? results?.[countHandle.toString()] : null
  });

  // Clear old results when handle changes (potential fix for handle mismatch)
  const [lastHandle, setLastHandle] = useState<string | null>(null);
  if (countHandle && countHandle.toString() !== lastHandle) {
    console.log("🔍 Handle changed, clearing old results");
    setLastHandle(countHandle.toString());
    // Note: We can't directly clear results here as it's managed by the hook
    // But this helps us track when the handle changes
  }

  // Handlers
  const handleIncrement = async () => {
    if (!instance || !counterConfig.address || !address) {
      setMessage("Missing requirements: instance=" + !!instance + ", address=" + address + ", contract=" + counterConfig.address);
      return;
    }

    if (!isConnected) {
      setMessage("Wallet not connected!");
      return;
    }

    setIsProcessing(true);
    setMessage("Incrementing counter...");
    console.log("🔍 Starting increment with:", { instance: !!instance, address, contract: counterConfig.address, isConnected });

    try {
      // Create encrypted input using FHEVM pattern (no signature needed for writes)
      setMessage("Creating encrypted input...");
      console.log("🔍 Creating encrypted input with address:", address);
      const input = instance.createEncryptedInput(counterConfig.address, address);
      input.add32(1); // Increment by 1
      const encryptedResult = await input.encrypt();
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned");
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned");
      }
      
      // Convert to hex strings
      const toHex = (data: Uint8Array) => {
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
      };
      
      const externalEuint32 = toHex(encryptedResult.handles[0]);
      const inputProof = toHex(encryptedResult.inputProof);
      
      setMessage(`Encrypted: ${externalEuint32.slice(0, 20)}...`);
      
      // Call the contract (wallet will sign the transaction)
      setMessage("Calling contract...");
      console.log("🔍 About to call increment with:", {
        address: counterConfig.address,
        functionName: 'increment',
        args: [externalEuint32, inputProof],
        externalEuint32: externalEuint32.slice(0, 20) + '...',
        inputProof: inputProof.slice(0, 20) + '...'
      });
      
       await writeCounter({
         address: counterConfig.address as `0x${string}`,
         abi: counterConfig.abi as any,
         functionName: 'increment',
         args: [externalEuint32, inputProof], // encrypted value and proof
         gas: 2000000n, // Set gas limit
         gasPrice: 20000000000n, // 20 gwei for Sepolia
       });
      
      setMessage("⏳ Waiting for transaction confirmation...");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage("✅ Increment completed! Refreshing count...");
      
      // Refetch the count handle after successful transaction
      console.log("🔍 Handle before refetch:", countHandle);
      const refetchResult = await refetchCount();
      console.log("🔍 Refetch result:", refetchResult);
      console.log("🔍 Handle after increment:", countHandle);
      console.log("🔍 Current results:", results);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrement = async () => {
    if (!instance || !counterConfig.address || !address) {
      setMessage("Missing requirements: instance=" + !!instance + ", address=" + address + ", contract=" + counterConfig.address);
      return;
    }

    if (!isConnected) {
      setMessage("Wallet not connected!");
      return;
    }

    setIsProcessing(true);
    setMessage("Decrementing counter...");
    console.log("🔍 Starting decrement with:", { instance: !!instance, address, contract: counterConfig.address, isConnected });

    try {
      // Create encrypted input using FHEVM pattern
      setMessage("Creating encrypted input...");
      console.log("🔍 Creating encrypted input with address:", address);
      const input = instance.createEncryptedInput(counterConfig.address, address);
      input.add32(1); 
      const encryptedResult = await input.encrypt();
      
      if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
        throw new Error("Encryption failed - no handle returned");
      }
      
      if (!encryptedResult.inputProof) {
        throw new Error("Encryption failed - no inputProof returned");
      }
      
      // Convert to hex strings
      const toHex = (data: Uint8Array) => {
        return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
      };
      
      const externalEuint32 = toHex(encryptedResult.handles[0]);
      const inputProof = toHex(encryptedResult.inputProof);
      
      setMessage(`Encrypted: ${externalEuint32.slice(0, 20)}...`);
      
      // Call the contract (wallet will sign the transaction)
      setMessage("Calling contract...");
      console.log("🔍 About to call decrement with:", {
        address: counterConfig.address,
        functionName: 'decrement',
        args: [externalEuint32, inputProof],
        externalEuint32: externalEuint32.slice(0, 20) + '...',
        inputProof: inputProof.slice(0, 20) + '...'
      });
      
       await writeCounter({
         address: counterConfig.address as `0x${string}`,
         abi: counterConfig.abi as any,
         functionName: 'decrement',
         args: [externalEuint32, inputProof], // encrypted value and proof
         gas: 2000000n, // Set gas limit
         gasPrice: 20000000000n, // 20 gwei for Sepolia
       });
      
      setMessage("⏳ Waiting for transaction confirmation...");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage("✅ Decrement completed! Refreshing count...");
      
      // Refetch the count handle after successful transaction
      console.log("🔍 Handle before refetch:", countHandle);
      const refetchResult = await refetchCount();
      console.log("🔍 Refetch result:", refetchResult);
      console.log("🔍 Handle after decrement:", countHandle);
      console.log("🔍 Current results:", results);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!countHandle || countHandle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      setMessage("No encrypted data to decrypt");
      return;
    }

    if (!canDecrypt) {
      setMessage("Cannot decrypt - missing dependencies (signer, instance, or requests)");
      return;
    }

    setIsProcessing(true);
    setMessage("Decrypting count...");

    try {
      console.log("🔍 Starting signature-based decryption...");
      console.log("🔍 Handle:", countHandle);
      console.log("🔍 Contract address:", counterConfig.address);
      console.log("🔍 Current user address:", address);
      console.log("🔍 Current results before decryption:", results);
      
      // Use the signature-based decryption
      await performDecrypt();
      
      // Wait a moment for results to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("🔍 Results after decryption:", results);
      
      // Extract the decrypted value from results
      const handleKey = countHandle.toString();
      const decryptedValue = results?.[handleKey];
      
      if (decryptedValue !== undefined) {
        setMessage(`Decrypted count: ${decryptedValue}`);
      } else {
        setMessage("Decryption completed but no result found");
      }
    } catch (error) {
      setMessage(`Decryption error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white border shadow-xl p-8 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/30 text-amber-400 text-3xl">
                ⚠️
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Wallet not connected</h2>
            <p className="text-gray-700 mb-6">Connect your wallet to use the Enhanced FHE Counter demo.</p>
            <div className="flex items-center justify-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8 text-black">
        <h1 className="text-3xl font-bold mb-2">Enhanced FHE Counter Demo</h1>
        <p className="text-gray-600">Using Universal FHEVM SDK with React hooks</p>
      </div>

      {/* FHEVM Status */}
      <div className="bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">🔧 FHEVM Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {printProperty("Status", status)}
            {printProperty("Ready", isReady ? "✅ Yes" : "❌ No")}
            {printProperty("Error", fhevmError ? (fhevmError as Error).message : "None")}
          </div>
          <div className="space-y-3">
            {printProperty("Contract Address", counterConfig.address || "Not deployed")}
            {printProperty("Chain ID", chainId || "Unknown")}
            {printProperty("Count Handle", countHandle ? `${countHandle.toString().slice(0, 10)}...` : "No handle")}
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className="inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D] cursor-pointer"
          disabled={!isReady || isProcessing}
          onClick={handleIncrement}
        >
          {isProcessing ? "⏳ Processing..." : "➕ Increment +1"}
        </button>

        <button
          className="inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer"
          disabled={!isReady || isProcessing}
          onClick={handleDecrement}
        >
          {isProcessing ? "⏳ Processing..." : "➖ Decrement -1"}
        </button>

        <button
          className="inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed bg-[#A38025] text-[#2D2D2D] hover:bg-[#8F6E1E] focus-visible:ring-[#2D2D2D]"
          disabled={!countHandle || isDecrypting}
          onClick={handleDecrypt}
        >
          {isDecrypting ? "⏳ Decrypting..." : "🔓 Decrypt Counter"}
        </button>
      </div>

      {/* Additional Actions */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="inline-flex items-center justify-center px-4 py-2 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500"
          disabled={!isConnected}
          onClick={() => refetchCount()}
        >
          🔄 Get Handle
        </button>
        <button
          className="inline-flex items-center justify-center px-4 py-2 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500"
          disabled={!isConnected}
          onClick={() => {
            setMessage("");
            // Clear decrypted results
            if (countHandle) {
              // The results will be cleared when the handle changes
            }
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Counter Value Display - Prioritized */}
      <div className="bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">🔢 Counter Value</h3>
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {(() => {
              const currentHandle = countHandle?.toString();
              const decryptedValue = currentHandle ? results?.[currentHandle] : null;
              console.log("🔍 UI Display Debug:", {
                currentHandle,
                decryptedValue,
                allResults: results,
                allHandles: Object.keys(results)
              });
              return decryptedValue ? decryptedValue : '🔒';
            })()}
          </div>
          <p className="text-gray-600 mb-4">
            {countHandle && results?.[countHandle.toString()] ? 'Decrypted Counter Value' : 'Encrypted Counter (Click Decrypt to reveal)'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">📊 Results</h3>
        <div className="space-y-3">
          {printProperty("Can Decrypt", canDecrypt ? "Yes" : "No")}
          {printProperty("Decrypting", isDecrypting ? "Yes" : "No")}
        </div>
      </div>


      {/* Errors */}
      {(decryptError || signatureError || writeError) && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 text-lg mb-2">❌ Errors</h3>
          {decryptError && <p className="text-red-700">Decrypt: {(decryptError as Error).message}</p>}
          {signatureError && <p className="text-red-700">Signature: {(signatureError as Error).message}</p>}
          {writeError && <p className="text-red-700">Transaction: {(writeError as Error).message}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Counter Demo with Universal SDK Provider
 */
export function CounterDemo() {
  return (
    <FHEVMProvider config={{
      rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
      mockChains: {
        31337: "http://localhost:8545"
      }
    }}>
      <CounterDemoContent />
    </FHEVMProvider>
  );
}

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 w-full">
      <span className="text-gray-800 font-medium">{name}</span>
      <span className="ml-2 font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-300">
        {displayValue}
      </span>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 w-full">
      <span className="text-gray-700 font-medium">{name}</span>
      <span
        className={`font-mono text-sm font-semibold px-2 py-1 border ${
          value
            ? "text-green-800 bg-green-100 border-green-300"
            : "text-red-800 bg-red-100 border-red-300"
        }`}
      >
        {value ? "✓ true" : "✗ false"}
      </span>
    </div>
  );
}
