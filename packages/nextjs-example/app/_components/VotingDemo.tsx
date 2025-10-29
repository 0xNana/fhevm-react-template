"use client";

import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { FHEVMProvider, useFHEVM, useFHEVMSignature, useFHEDecrypt, useInMemoryStorage } from "@fhevm/sdk/react";
import { ethers } from "ethers";
import { useReadContract, useWriteContract } from "wagmi";
import { getContractConfig } from "~~/contracts";

/**
 * FHE Voting Demo using Universal FHEVM SDK
 * 
 * This component demonstrates confidential voting operations:
 * - Create voting sessions
 * - Cast encrypted votes (Yes/No)
 * - View encrypted results
 * - Decrypt and display final results
 */
function VotingDemoContent() {
  const { isConnected, chain, address } = useAccount();
  const chainId = chain?.id;

  // Contract configuration
  const votingConfig = getContractConfig('FHEVoting');

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

  // EIP-712 signature hook for decryption
  const { error: signatureError } = useFHEVMSignature(instance, address);

  // Create ethers signer from window.ethereum (same as contract operations use)
  const ethersSigner = useMemo(() => {
    if (!isConnected || !address) return undefined;
    
    try {
      // Use the same ethereum provider that Wagmi uses
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = new ethers.JsonRpcSigner(provider, address);
      
      return signer;
    } catch (error) {
      console.error('Failed to create ethers signer:', error);
      return undefined;
    }
  }, [isConnected, address]);

  // Contract interactions
  const { data: sessionCounter, refetch: refetchSessionCounter } = useReadContract({
    address: votingConfig.address as `0x${string}`,
    abi: votingConfig.abi as any,
    functionName: "sessionCounter",
    query: {
      enabled: Boolean(votingConfig.address && isReady),
      refetchOnWindowFocus: false,
    },
  });

  // State
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [sessionDescription, setSessionDescription] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<string>("3600"); 
  const [selectedSessionId, setSelectedSessionId] = useState<string>("1");
  const [voteChoice, setVoteChoice] = useState<"yes" | "no">("yes");
  const [votingResults, setVotingResults] = useState<any>(null);

  // Session info contract call
  const { data: sessionInfo, refetch: refetchSessionInfo } = useReadContract({
    address: votingConfig.address as `0x${string}`,
    abi: votingConfig.abi as any,
    functionName: "getVotingSessionInfo",
    args: [selectedSessionId ? BigInt(selectedSessionId) : BigInt(0)],
    query: {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  });

  // Has voted status
  const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
    address: votingConfig.address as `0x${string}`,
    abi: votingConfig.abi as any,
    functionName: "hasUserVoted",
    args: [address as `0x${string}`, selectedSessionId ? BigInt(selectedSessionId) : BigInt(0)],
    query: {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  });

  // Encrypted results contract call
  const { data: encryptedResults, refetch: refetchEncryptedResults } = useReadContract({
    address: votingConfig.address as `0x${string}`,
    abi: votingConfig.abi as any,
    functionName: "getEncryptedResults",
    args: [selectedSessionId ? BigInt(selectedSessionId) : BigInt(0)],
    query: {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  });


  const { writeContract: writeVoting, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract();

  // In-memory storage for decryption signatures
  const fhevmDecryptionSignatureStorage = useInMemoryStorage();
  
  // Results handles for decryption (similar to Vue implementation)
  const [resultsHandles, setResultsHandles] = useState<{yesVotes: string | null, noVotes: string | null, totalVotes: string | null}>({
    yesVotes: null,
    noVotes: null,
    totalVotes: null
  });

  // Decryption requests for signature-based decryption
  const requests = useMemo(() => {
    if (!votingConfig.address || !resultsHandles.yesVotes || !resultsHandles.noVotes || !resultsHandles.totalVotes) return undefined;
    
    const requestList = [];
    if (resultsHandles.yesVotes && resultsHandles.yesVotes !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      requestList.push({ 
        handle: resultsHandles.yesVotes, 
        contractAddress: votingConfig.address as `0x${string}` 
      });
    }
    if (resultsHandles.noVotes && resultsHandles.noVotes !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      requestList.push({ 
        handle: resultsHandles.noVotes, 
        contractAddress: votingConfig.address as `0x${string}` 
      });
    }
    if (resultsHandles.totalVotes && resultsHandles.totalVotes !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      requestList.push({ 
        handle: resultsHandles.totalVotes, 
        contractAddress: votingConfig.address as `0x${string}` 
      });
    }
    
    return requestList.length > 0 ? requestList : undefined;
  }, [votingConfig.address, resultsHandles]);
  
  // FHEVM Decryption using signature-based approach
  const {
    canDecrypt,
    decrypt: performDecrypt,
    isDecrypting,
    results,
    error: decryptError
  } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: fhevmDecryptionSignatureStorage.storage,
    requests
  });

  // Handlers
  const handleCreateSession = async () => {
    if (!votingConfig.address) return;
    
    setIsProcessing(true);
    setMessage("📝 Creating voting session...");
    
    try {
      if (!sessionTitle.trim() || !sessionDescription.trim()) {
        setMessage("Please enter title and description");
        return;
      }

      const duration = parseInt(sessionDuration);
      if (isNaN(duration) || duration <= 0) {
        setMessage("Please enter a valid duration");
        return;
      }

      // Reset any previous write state
      resetWrite();
      
      // Call the contract with proper parameters
      await writeVoting({
        address: votingConfig.address as `0x${string}`,
        abi: votingConfig.abi as any,
        functionName: 'createVotingSession',
        args: [sessionTitle, sessionDescription, BigInt(duration)],
        gas: 3000000n, 
        gasPrice: 30000000000n, 
      });
      
      setMessage("⏳ Waiting for transaction confirmation...");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`✅ Voting session created: "${sessionTitle}"`);
      
      // Refresh session counter
      await refetchSessionCounter();
      
      // Clear form
      setSessionTitle("");
      setSessionDescription("");
      setSessionDuration("3600");
    } catch (error) {
      setMessage(`❌ Session creation failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCastVote = async () => {
    if (!instance || !votingConfig.address || !address) return;
    
    setIsProcessing(true);
    setMessage("🗳️ Casting vote...");
    
    try {
      const sessionIdNum = parseInt(selectedSessionId);
      if (isNaN(sessionIdNum) || sessionIdNum < 0) {
        setMessage("Please enter a valid session ID");
        return;
      }

      // 1. Ensure FHEVM instance is ready
      if (!instance) {
        throw new Error("FHEVM instance not ready");
      }
      
      setMessage("🔐 Creating encrypted vote...");
      
      let externalEuint32: string;
      let inputProof: string;
      
      try {
        const input = instance.createEncryptedInput(votingConfig.address, address);
        
        const voteValue = voteChoice === "yes";
        const voteAsInt = voteValue ? 1 : 0;
        input.add32(voteAsInt);
        
        const encryptedResult = await input.encrypt();
        
        if (!encryptedResult || !encryptedResult.handles || !encryptedResult.handles[0]) {
          throw new Error("Encryption failed - no handle returned");
        }
        
        if (!encryptedResult.inputProof) {
          throw new Error("Encryption failed - no inputProof returned");
        }
        
        const handle = encryptedResult.handles[0];
        
        if (handle.length !== 32) {
          throw new Error(`Invalid handle length: ${handle.length} bytes, expected 32 bytes for bytes32`);
        }
        
        const toHex = (data: Uint8Array) => {
          if (!data || !Array.isArray(Array.from(data))) {
            throw new Error("Invalid data for hex conversion");
          }
          return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
        };
        
        externalEuint32 = toHex(handle);
        inputProof = toHex(encryptedResult.inputProof);
        
      } catch (encryptError) {
        throw new Error(`Encryption failed: ${encryptError instanceof Error ? encryptError.message : String(encryptError)}`);
      }
      
      setMessage("📝 Signing transaction...");
      
      resetWrite();
      
      try {
        const sessionInfoResult = await refetchSessionInfo();
        
        if (!sessionInfoResult.data) {
          throw new Error("Session does not exist");
        }
        
        const sessionData = sessionInfoResult.data as any;
        
        if (!sessionData[2]) { 
          throw new Error("Session is not active");
        }
        
        if (Date.now() / 1000 > Number(sessionData[3])) { 
          throw new Error("Session has expired");
        }
        
        const hasVotedResult = await refetchHasVoted();
        
        if (hasVotedResult.data) {
          throw new Error("User has already voted in this session");
        }
        
        // Write to contract with proper hex strings
        await writeVoting({
          address: votingConfig.address as `0x${string}`,
          abi: votingConfig.abi as any,
          functionName: 'castVote',
          args: [BigInt(sessionIdNum), externalEuint32, inputProof], // uint256 sessionId, externalEuint32 vote, bytes calldata inputProof
          gas: 5000000n, // Further increased gas limit for FHE operations
          gasPrice: 50000000000n, // 50 gwei for Sepolia (further increased)
        });
        
        setMessage("⏳ Waiting for transaction confirmation...");
        
        // Wait for transaction to be confirmed
        await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time
        
        // Check if the transaction actually succeeded by checking the voting status
        await refetchHasVoted();
        
        if (hasVoted) {
          setMessage(`✅ Voted ${voteChoice}! Vote recorded successfully.`);
        } else {
          setMessage(`⚠️ Transaction submitted but vote not recorded. This suggests a contract execution issue.`);
        }
        
        // Refresh voting status
        await refetchHasVoted();
        
      } catch (txError) {
        throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`);
      }
    } catch (error) {
      setMessage(`❌ Vote casting failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetSessionInfo = async () => {
    if (!votingConfig.address) return;
    
    try {
      const sessionIdNum = parseInt(selectedSessionId);
      if (isNaN(sessionIdNum) || sessionIdNum < 0) {
        setMessage("Please enter a valid session ID");
        return;
      }

      setMessage(`Getting session ${sessionIdNum} info...`);
      
      const result = await refetchSessionInfo();
      const hasVotedResult = await refetchHasVoted();
      
      if (result.data) {
        const sessionData = result.data as any;
        setMessage(`✅ Session ${sessionIdNum} info retrieved - Active: ${sessionData[2] ? 'Yes' : 'No'}, Has Voted: ${hasVotedResult.data ? 'Yes' : 'No'}`);
      } else {
        setMessage(`❌ Session ${sessionIdNum} not found`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Fetch results handles (similar to Vue implementation)
  const fetchResultsHandles = async () => {
    if (!votingConfig.address || !isReady) {
      setMessage("⚠️ Missing requirements for fetching results");
      return;
    }
    
    const sessionIdNum = parseInt(selectedSessionId);
    if (isNaN(sessionIdNum) || sessionIdNum < 0) {
      setMessage("⚠️ Please enter a valid session ID");
      return;
    }
    
    try {
      setMessage(`Fetching results for session ${sessionIdNum}...`);
      
      // Check if session has ended first
      const sessionInfoResult = await refetchSessionInfo();
      
      if (sessionInfoResult.data && (sessionInfoResult.data as any)[2] === true) { // isActive is true
        setMessage("⚠️ Session is still active - results only available after session ends");
        return;
      }
      
      // Call getEncryptedResults
      const result = await refetchEncryptedResults();
      
      if (result.error) {
        throw new Error(`Contract call failed: ${result.error.message || result.error}`);
      }
      
      if (!result.data) {
        throw new Error("Failed to fetch encrypted results - session may not exist or may not have ended");
      }
      
      // Extract handles from the result (similar to Vue implementation)
      let yesVotesHandle: string, noVotesHandle: string, totalVotesHandle: string;
      
      if (Array.isArray(result.data) && result.data.length === 3) {
        [yesVotesHandle, noVotesHandle, totalVotesHandle] = result.data;
      } else if ((result.data as any).yesVotes !== undefined) {
        ({ yesVotes: yesVotesHandle, noVotes: noVotesHandle, totalVotes: totalVotesHandle } = result.data as { yesVotes: string, noVotes: string, totalVotes: string });
      } else if ((result.data as any)[0] !== undefined) {
        yesVotesHandle = (result.data as any)[0];
        noVotesHandle = (result.data as any)[1]; 
        totalVotesHandle = (result.data as any)[2];
      } else {
        throw new Error("Unknown data structure returned from getEncryptedResults");
      }
      
      // Check if handles are valid
      if (!yesVotesHandle || !noVotesHandle || !totalVotesHandle || 
          yesVotesHandle === "0x0000000000000000000000000000000000000000000000000000000000000000" || 
          noVotesHandle === "0x0000000000000000000000000000000000000000000000000000000000000000" || 
          totalVotesHandle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setMessage("⚠️ No votes recorded for this session yet or session has no results");
        return;
      }
      
      // Store the handles for decryption
      setResultsHandles({
        yesVotes: yesVotesHandle,
        noVotes: noVotesHandle,
        totalVotes: totalVotesHandle
      });
      
      setMessage(`✅ Results handles fetched successfully for session ${sessionIdNum}!`);
      
    } catch (error) {
      setMessage(`❌ Failed to fetch results: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleGetResults = async () => {
    if (!instance || !votingConfig.address || !address) return;
    
    setIsProcessing(true);
    setMessage("Getting encrypted results...");
    
    try {
      const sessionIdNum = parseInt(selectedSessionId);
      if (isNaN(sessionIdNum) || sessionIdNum < 0) {
        setMessage("Please enter a valid session ID");
        return;
      }

      // First fetch the results handles if we don't have them
      if (!resultsHandles.yesVotes || !resultsHandles.noVotes || !resultsHandles.totalVotes) {
        setMessage("Fetching results handles first...");
        await fetchResultsHandles();
        
        if (!resultsHandles.yesVotes || !resultsHandles.noVotes || !resultsHandles.totalVotes) {
          setMessage("No results handles available for decryption");
          return;
        }
      }

      setMessage(`Decrypting results for session ${sessionIdNum}...`);
      
      if (!canDecrypt) {
        setMessage("Cannot decrypt - missing dependencies");
        return;
      }

      setMessage("Decrypting voting results...");
      await performDecrypt();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Extract decrypted values from results
      const yesVotesKey = resultsHandles.yesVotes;
      const noVotesKey = resultsHandles.noVotes;
      const totalVotesKey = resultsHandles.totalVotes;
      
      const yesVotes = results?.[yesVotesKey];
      const noVotes = results?.[noVotesKey];
      const totalVotes = results?.[totalVotesKey];
      
      if (yesVotes !== undefined && noVotes !== undefined && totalVotes !== undefined) {
        setVotingResults({
          yesVotes: Number(yesVotes),
          noVotes: Number(noVotes),
          totalVotes: Number(totalVotes)
        });
        setMessage(`✅ Voting results decrypted! Yes: ${yesVotes}, No: ${noVotes}, Total: ${totalVotes}`);
      } else {
        setMessage("Decryption completed but some results are missing");
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async () => {
    if (!votingConfig.address) return;
    
    setIsProcessing(true);
    setMessage("🔚 Ending voting session...");
    
    try {
      const sessionIdNum = parseInt(selectedSessionId);
      if (isNaN(sessionIdNum) || sessionIdNum < 0) {
        setMessage("Please enter a valid session ID");
        return;
      }

      // Reset any previous write state
      resetWrite();
      
      // Call the contract with proper parameters
      await writeVoting({
        address: votingConfig.address as `0x${string}`,
        abi: votingConfig.abi as any,
        functionName: 'endVotingSession',
        args: [BigInt(sessionIdNum)],
        gas: 3000000n, // Increased gas limit for FHE operations
        gasPrice: 30000000000n, // 30 gwei for Sepolia (increased)
      });
      
      setMessage("⏳ Waiting for transaction confirmation...");
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`✅ Voting session ${sessionIdNum} ended`);
      
      // Refresh session info
      await handleGetSessionInfo();
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status indicators
  const getStatusColor = () => {
    if (fhevmError || signatureError || decryptError) return "text-red-500";
    if (status === "loading" || isDecrypting) return "text-yellow-500";
    if (status === "ready" && isReady) return "text-green-500";
    return "text-gray-500";
  };

  const getStatusText = () => {
    if (fhevmError) return `FHEVM Error: ${fhevmError.message}`;
    if (signatureError) return `Signature Error: ${signatureError.message}`;
    if (decryptError) return `Decryption Error: ${decryptError.message}`;
    if (status === "loading") return "Initializing FHEVM...";
    if (status === "ready" && isReady) return "FHEVM Ready";
    return "FHEVM Not Ready";
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white border shadow-xl p-8 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-4xl">
                🗳️
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet not connected</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to use the FHE Voting demo.</p>
            <div className="flex items-center justify-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🗳️ FHE Voting Demo
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Confidential voting with encrypted votes and results
        </p>
        <p className="text-sm text-gray-500">
          Next.js + Universal FHEVM SDK
        </p>
      </div>

      {/* FHEVM Status */}
      <div className="bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900">
        <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">🔧 Voting Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Status</span>
              <span className={`font-mono text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Ready</span>
              <span className={`font-mono text-sm ${isReady ? 'text-green-600' : 'text-red-600'}`}>
                {isReady ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Wallet</span>
              <span className="font-mono text-sm">{address?.slice(0, 10)}...</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Chain ID</span>
              <span className="font-mono text-sm">{chainId || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Session Counter</span>
              <span className="font-mono text-sm text-blue-600">
                {sessionCounter?.toString() || 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
              <span className="font-medium">Error</span>
              <span className="font-mono text-sm text-red-600">
                {fhevmError ? fhevmError.message : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Session */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">📝 Create Voting Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter session title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Enter session description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="3600"
              />
            </div>
            <button
              onClick={handleCreateSession}
              disabled={!isReady || isProcessing}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "⏳ Creating..." : "📝 Create Session"}
            </button>
          </div>
        </div>

        {/* Cast Vote */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">🗳️ Cast Vote</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="1"
                />
                <button
                  onClick={handleGetSessionInfo}
                  disabled={!isReady || isProcessing}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vote Choice</label>
              <select
                value={voteChoice}
                onChange={(e) => setVoteChoice(e.target.value as "yes" | "no")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              >
                <option value="yes">✅ Yes</option>
                <option value="no">❌ No</option>
              </select>
            </div>
            <button
              onClick={handleCastVote}
              disabled={!isReady || isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "⏳ Voting..." : "🗳️ Cast Vote"}
            </button>
          </div>
        </div>

        {/* End Session */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">🔚 End Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="1"
                />
                <button
                  onClick={handleGetSessionInfo}
                  disabled={!isReady || isProcessing}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
            <button
              onClick={handleEndSession}
              disabled={!isReady || isProcessing}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "⏳ Ending..." : "🔚 End Session"}
            </button>
          </div>
        </div>

        {/* View Results */}
        <div className="bg-white border shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">📊 View Results</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="1"
                />
                <button
                  onClick={handleGetSessionInfo}
                  disabled={!isReady || isProcessing}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchResultsHandles}
                disabled={!isReady || isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Fetch Handles
              </button>
              <button
                onClick={handleGetResults}
                disabled={!isReady || isProcessing}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "⏳ Decrypting..." : "🔓 Decrypt Results"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info Display */}
      {sessionInfo && Array.isArray(sessionInfo) && (
        <div className="bg-[#f4f4f4] shadow-lg p-6 text-gray-900">
          <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">📋 Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Title</span>
                <span className="font-mono text-sm">{sessionInfo[0] || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Description</span>
                <span className="font-mono text-sm">{sessionInfo[1] || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Active</span>
                <span className={`font-mono text-sm ${sessionInfo[2] ? 'text-green-600' : 'text-red-600'}`}>
                  {sessionInfo[2] ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">End Time</span>
                <span className="font-mono text-sm">{new Date(Number(sessionInfo[3]) * 1000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Handles Display */}
      {resultsHandles.yesVotes && (
        <div className="bg-[#f4f4f4] shadow-lg p-6 text-gray-900">
          <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">📊 Voting Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Results Handles</span>
                <span className="font-mono text-sm text-blue-600">
                  {resultsHandles.yesVotes ? `Yes: ${resultsHandles.yesVotes.slice(0, 10)}...` : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Decrypted Results</span>
                <span className="font-mono text-sm text-green-600">
                  {votingResults ? `Yes: ${votingResults.yesVotes}, No: ${votingResults.noVotes}` : 'None'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Processing</span>
                <span className={`font-mono text-sm ${isProcessing ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {isProcessing ? '⏳ Processing...' : '✅ Ready'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Can Decrypt</span>
                <span className={`font-mono text-sm ${canDecrypt ? 'text-green-600' : 'text-red-600'}`}>
                  {canDecrypt ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Results Display */}
      {votingResults && (
        <div className="bg-[#f4f4f4] shadow-lg p-6 text-gray-900">
          <h3 className="font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2">📊 Voting Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Yes Votes</span>
                <span className="font-mono text-sm text-green-600">{votingResults.yesVotes}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">No Votes</span>
                <span className="font-mono text-sm text-red-600">{votingResults.noVotes}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded">
                <span className="font-medium">Total Votes</span>
                <span className="font-mono text-sm text-blue-600">{votingResults.totalVotes}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
 * Main Voting Demo Component with FHEVM Provider
 */
export default function VotingDemo() {
  return (
    <FHEVMProvider config={{
      rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
      mockChains: {
        31337: "http://localhost:8545"
      }
    }}>
      <VotingDemoContent />
    </FHEVMProvider>
  );
}