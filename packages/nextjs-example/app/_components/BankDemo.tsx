"use client";

import { useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { FHEVMProvider, useFHEVM, useFHEVMSignature, useFHEDecrypt, useInMemoryStorage } from "@fhevm/sdk/react";
import { ethers } from "ethers";
import { useReadContract, useWriteContract } from "wagmi";
import { getContractConfig } from "~~/contracts";

/**
 * FHE Bank Demo using Universal FHEVM SDK
 * 
 * This component demonstrates confidential banking operations:
 * - Deposit encrypted amounts
 * - Withdraw encrypted amounts  
 * - Transfer between users
 * - View encrypted balances
 */
function BankDemoContent() {
  const { isConnected, chain, address } = useAccount();
  const chainId = chain?.id;

  // Contract configuration
  const bankConfig = getContractConfig('FHEBank');

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

  // Generate public key for encryption
  const publicKey = useMemo(() => {
    if (instance && isReady) {
      try {
        const keypair = instance.generateKeypair();
        return keypair.publicKey;
      } catch (error) {
        console.error("Failed to generate keypair:", error);
        return null;
      }
    }
    return null;
  }, [instance, isReady]);

  // EIP-712 signature hook for decryption
  const { generateSignature, signature, isSigning, error: signatureError } = useFHEVMSignature(instance, address);

  // Create ethers signer from window.ethereum (same as contract operations use)
  const ethersSigner = useMemo(() => {
    if (!isConnected || !address) return undefined;
    
    try {
      // Use the same ethereum provider that Wagmi uses
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = new ethers.JsonRpcSigner(provider, address);
      
      // Log signer methods for debugging
      console.log('🔍 Bank ethersSigner Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)));
      console.log('🔍 Bank ethersSigner has signTypedData:', typeof signer.signTypedData === 'function');
      
      return signer;
    } catch (error) {
      console.error('Failed to create ethers signer:', error);
      return undefined;
    }
  }, [isConnected, address]);

  // Contract interactions (like Vue version - always disabled initially)
  const { data: fetchedBalance, refetch: refetchBalance, error: fetchBalanceError } = useReadContract({
    address: bankConfig.address as `0x${string}`,
    abi: bankConfig.abi as any,
    functionName: "getEncryptedBalance",
    args: [address as `0x${string}`],
    query: {
      enabled: false, // Always disabled initially, fetch manually
      refetchOnWindowFocus: false,
    },
  });

  const { data: fetchedTotalSupply, refetch: refetchTotalSupply, error: fetchTotalSupplyError } = useReadContract({
    address: bankConfig.address as `0x${string}`,
    abi: bankConfig.abi as any,
    functionName: "getEncryptedTotalSupply",
    query: {
      enabled: false, // Always disabled initially, fetch manually
      refetchOnWindowFocus: false,
    },
  });

  // In-memory storage for decryption signatures
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();

  const { writeContract: writeBank, isPending: isWritePending, error: writeError, isSuccess: isWriteSuccess, reset: resetWrite } = useWriteContract();

  // State
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState<string>("100");
  
  // Separate state for balance handle (like Vue version)
  const [balanceHandle, setBalanceHandle] = useState<string | null>(null);
  const [totalSupplyHandle, setTotalSupplyHandle] = useState<string | null>(null);

  // Decryption requests for signature-based decryption
  const requests = useMemo(() => {
    if (!bankConfig.address) return undefined;
    
    const requestList = [];
    if (balanceHandle && balanceHandle !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      requestList.push({ 
        handle: balanceHandle.toString(), 
        contractAddress: bankConfig.address as `0x${string}` 
      });
    }
    if (totalSupplyHandle && totalSupplyHandle !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      requestList.push({ 
        handle: totalSupplyHandle.toString(), 
        contractAddress: bankConfig.address as `0x${string}` 
      });
    }
    
    return requestList.length > 0 ? requestList : undefined;
  }, [bankConfig.address, balanceHandle, totalSupplyHandle]);

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

  // Watch for changes in fetchedBalance and update balanceHandle (like Vue version)
  useEffect(() => {
    console.log("🔍 Bank fetchedBalance watcher triggered:", fetchedBalance);
    if (fetchedBalance) {
      setBalanceHandle(fetchedBalance as string);
      console.log("🔍 Bank Fetched balance:", fetchedBalance);
    }
  }, [fetchedBalance]);

  // Watch for changes in fetchedTotalSupply and update totalSupplyHandle (like Vue version)
  useEffect(() => {
    console.log("🔍 Bank fetchedTotalSupply watcher triggered:", fetchedTotalSupply);
    if (fetchedTotalSupply) {
      setTotalSupplyHandle(fetchedTotalSupply as string);
      console.log("🔍 Bank Fetched total supply:", fetchedTotalSupply);
    }
  }, [fetchedTotalSupply]);

  // Debug: Log current state for debugging
  console.log("🔍 Bank Current state (using getEncryptedBalance/getEncryptedTotalSupply):", {
    balanceHandle,
    totalSupplyHandle,
    resultsKeys: Object.keys(results),
    currentBalance: balanceHandle ? results?.[balanceHandle.toString()] : null,
    currentTotalSupply: totalSupplyHandle ? results?.[totalSupplyHandle.toString()] : null,
    // Debug decryption dependencies
    hasInstance: Boolean(instance),
    hasEthersSigner: Boolean(ethersSigner),
    hasRequests: Boolean(requests),
    requestsLength: requests?.length,
    canDecrypt,
    isDecrypting
  });
  const [recipient, setRecipient] = useState<string>("");

  // Manual balance fetch function (like Vue version)
  const fetchBalanceHandle = async () => {
    console.log("🔍 Bank fetchBalanceHandle called");
    console.log("🔍 Bank bankConfig.address:", bankConfig.address);
    console.log("🔍 Bank isReady:", isReady);
    console.log("🔍 Bank address:", address);
    
    if (!bankConfig.address || !isReady || !address) {
      console.log("🔍 Bank Missing requirements for fetchBalanceHandle");
      return;
    }
    
    try {
      console.log("🔍 Bank Calling refetchBalance (getEncryptedBalance) directly...");
      const result = await refetchBalance();
      console.log("🔍 Bank refetchBalance result:", result);
      console.log("🔍 Bank refetchBalance completed");
    } catch (error) {
      console.error("Failed to fetch encrypted balance handle:", error);
    }
  };

  // Handlers
  const handleDeposit = async () => {
    if (!instance || !bankConfig.address || !address) return;
    
    setIsProcessing(true);
    setMessage("Depositing to bank...");
    
    try {
      const amountNum = parseInt(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setMessage("Please enter a valid amount");
        return;
      }

      // Create encrypted input using FHEVM pattern
      setMessage("Creating encrypted input...");
      const input = instance.createEncryptedInput(bankConfig.address, address);
      input.add64(amountNum); // Deposit amount (64-bit for FHEBank contract)
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
      
      const externalEuint64 = toHex(encryptedResult.handles[0]);
      const inputProof = toHex(encryptedResult.inputProof);
      
      setMessage(`Encrypted: ${externalEuint64.slice(0, 20)}...`);
      
      // Reset any previous write state (like Vue version)
      resetWrite();
      
      // Call the contract
      setMessage("📝 Signing transaction...");
      await writeBank({
        address: bankConfig.address as `0x${string}`,
        abi: bankConfig.abi as any,
        functionName: 'deposit',
        args: [externalEuint64, inputProof], // encrypted amount and proof (64-bit)
        gas: 2000000n, // Set gas limit
        gasPrice: 20000000000n, // 20 gwei for Sepolia
      });
      
      setMessage(`Deposited ${amountNum}! Refreshing balance...`);
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch balance handle after successful transaction (like Vue version)
      await fetchBalanceHandle();
      await refetchTotalSupply();
      console.log("🔍 Bank Balance after deposit:", balanceHandle);
      console.log("🔍 Bank Balance handle type:", typeof balanceHandle);
      console.log("🔍 Bank Balance handle value:", balanceHandle);
    } catch (error) {
      setMessage(`Deposit failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!instance || !bankConfig?.address || !address) return;
    
    setIsProcessing(true);
    setMessage("Withdrawing from bank...");
    
    try {
      const amountNum = parseInt(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setMessage("Please enter a valid amount");
        return;
      }

      // Create encrypted input using FHEVM pattern
      setMessage("Creating encrypted input...");
      const input = instance.createEncryptedInput(bankConfig.address, address);
      input.add64(amountNum); // Withdraw amount (64-bit for FHEBank contract)
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
      
      const externalEuint64 = toHex(encryptedResult.handles[0]);
      const inputProof = toHex(encryptedResult.inputProof);
      
      setMessage(`Withdrawing ${amountNum} (encrypted: ${externalEuint64.slice(0, 20)}...)`);
      
      // Reset any previous write state (like Vue version)
      resetWrite();
      
      // Call the contract
      setMessage("📝 Signing transaction...");
      await writeBank({
        address: bankConfig.address as `0x${string}`,
        abi: bankConfig.abi as any,
        functionName: 'withdraw',
        args: [externalEuint64, inputProof], // encrypted amount and proof (64-bit)
        gas: 2000000n, // Set gas limit
        gasPrice: 20000000000n, // 20 gwei for Sepolia
      });
      
      setMessage("Withdrawal completed successfully!");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch balance handle after successful transaction (like Vue version)
      await fetchBalanceHandle();
      await refetchTotalSupply();
      console.log("🔍 Bank Balance after withdrawal:", balanceHandle);
    } catch (error) {
      setMessage(`Withdrawal failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!instance || !bankConfig?.address || !recipient || !address) return;
    
    setIsProcessing(true);
    setMessage("Transferring funds...");
    
    try {
      const amountNum = parseInt(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setMessage("Please enter a valid amount");
        return;
      }

      if (!recipient.startsWith("0x") || recipient.length !== 42) {
        setMessage("Please enter a valid recipient address");
        return;
      }

      // Create encrypted input using FHEVM pattern
      setMessage("Creating encrypted input...");
      const input = instance.createEncryptedInput(bankConfig.address, address);
      input.add64(amountNum); // Transfer amount (64-bit for FHEBank contract)
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
      
      const externalEuint64 = toHex(encryptedResult.handles[0]);
      const inputProof = toHex(encryptedResult.inputProof);
      
      setMessage(`Transferring ${amountNum} to ${recipient} (encrypted: ${externalEuint64.slice(0, 20)}...)`);
      
      // Reset any previous write state (like Vue version)
      resetWrite();
      
      // Call the contract
      setMessage("📝 Signing transaction...");
      await writeBank({
        address: bankConfig.address as `0x${string}`,
        abi: bankConfig.abi as any,
        functionName: 'transfer',
        args: [recipient, externalEuint64, inputProof], // recipient, encrypted amount and proof (64-bit)
        gas: 2000000n, // Set gas limit
        gasPrice: 20000000000n, // 20 gwei for Sepolia
      });
      
      setMessage("Transfer completed successfully!");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch balance handle after successful transaction (like Vue version)
      await fetchBalanceHandle();
      console.log("🔍 Bank Balance after transfer:", balanceHandle);
    } catch (error) {
      setMessage(`Transfer failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecryptBalance = async () => {
    if (!balanceHandle || balanceHandle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      setMessage("No balance data to decrypt");
      return;
    }

    if (!instance || !bankConfig.address || !address) {
      setMessage("FHEVM not ready");
      return;
    }

    if (!canDecrypt) {
      setMessage("⚠️ Cannot decrypt - missing dependencies (signer, instance, or requests)");
      return;
    }

    setIsProcessing(true);
    setMessage("Decrypting balance...");

    try {
      await performDecrypt();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const handleKey = balanceHandle.toString();
      const decryptedValue = results?.[handleKey];
      
      if (decryptedValue !== undefined) {
        setMessage(`Your balance: ${decryptedValue}`);
      } else {
        setMessage("Decryption completed but no result found");
      }
    } catch (error) {
      setMessage(`Balance decryption failed: ${error instanceof Error ? error.message : String(error)}`);
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
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-900/30 text-blue-400 text-3xl">
                🏦
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Wallet not connected</h2>
            <p className="text-gray-700 mb-6">Connect your wallet to use the FHE Bank demo.</p>
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
        <h1 className="text-3xl font-bold mb-2">🏦 FHE Bank Demo</h1>
        <p className="text-gray-600">Confidential banking with encrypted deposits, withdrawals, and transfers</p>
      </div>

      {/* Your Balance - Prioritized */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 shadow-lg p-6 mb-6 text-gray-900 border-2 border-green-200">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-2 border-green-300 pb-2">💰 Your Balance</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {balanceHandle ? (results?.[balanceHandle.toString()] || "Encrypted") : "No balance"}
          </div>
          <p className="text-gray-600 text-sm">
            {balanceHandle ? "Decrypted balance" : "Connect wallet and fetch balance to see your funds"}
          </p>
        </div>
      </div>

      {/* FHEVM Status - Simplified */}
      <div className="bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">🔧 Bank Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {printProperty("Status", status)}
            {printProperty("Ready", isReady ? "✅ Yes" : "❌ No")}
            {printProperty("Error", fhevmError ? (fhevmError as Error).message : "None")}
          </div>
          <div className="space-y-3">
            {printProperty("Contract Address", bankConfig?.address || "Not deployed")}
            {printProperty("Your Address", address || "Not connected")}
            {printProperty("Balance Handle", balanceHandle ? `${balanceHandle.slice(0, 8)}...${balanceHandle.slice(-8)}` : "No balance")}
          </div>
        </div>
      </div>

      {/* Bank Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">💰 Deposit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount to deposit"
              />
            </div>
            <button
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isReady || isProcessing}
              onClick={handleDeposit}
            >
              {isProcessing ? "⏳ Processing..." : "💰 Deposit"}
            </button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">💸 Withdraw</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount to withdraw"
              />
            </div>
            <button
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isReady || isProcessing}
              onClick={handleWithdraw}
            >
              {isProcessing ? "⏳ Processing..." : "💸 Withdraw"}
            </button>
          </div>
        </div>

        {/* Transfer */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">🔄 Transfer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount to transfer"
              />
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isReady || isProcessing || !recipient}
              onClick={handleTransfer}
            >
              {isProcessing ? "⏳ Processing..." : "🔄 Transfer"}
            </button>
          </div>
        </div>

        {/* View Balance */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">👁️ View Balance</h3>
          <div className="space-y-4">
            <p className="text-gray-600">Decrypt your encrypted balance</p>
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!balanceHandle || isDecrypting}
                onClick={handleDecryptBalance}
              >
                {isDecrypting ? "⏳ Decrypting..." : "👁️ Decrypt Balance"}
              </button>
              <button
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected}
                onClick={fetchBalanceHandle}
              >
                🔄 Get Balance
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Errors */}
      {(decryptError || signatureError) && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 text-lg mb-2">❌ Errors</h3>
          {decryptError && <p className="text-red-700">Decrypt: {(decryptError as Error).message}</p>}
          {signatureError && <p className="text-red-700">Signature: {(signatureError as Error).message}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Bank Demo with Universal SDK Provider
 */
export function BankDemo() {
  return (
    <FHEVMProvider config={{
      rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
      mockChains: {
        31337: "http://localhost:8545"
      }
    }}>
      <BankDemoContent />
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
