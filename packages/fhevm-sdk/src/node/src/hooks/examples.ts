/**
 * Examples of using FHEVM hooks in Node.js
 * 
 * This file demonstrates how to use the wagmi-like hooks
 * for FHEVM operations in Node.js environments.
 */

import { useFHEVM, useContract, useReadContract, useWriteContract, useEncrypt, useDecrypt, useBatchEncrypt, useBatchDecrypt } from './index.js'
import type { FHEVMHookConfig, ContractHookConfig, ReadContractOptions, WriteContractOptions } from './types.js'

// Example 1: Basic FHEVM setup
export async function basicFHEVMSetup() {
  const config: FHEVMHookConfig = {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    autoInit: true
  }

  const fhevm = useFHEVM(config)
  
  if (!fhevm.isReady) {
    await fhevm.initialize()
  }

  console.log('FHEVM is ready:', fhevm.isReady)
  return fhevm
}

// Example 2: Contract interaction
export async function contractInteraction() {
  const contractConfig: ContractHookConfig = {
    address: '0x1234567890123456789012345678901234567890',
    abi: [
      {
        "inputs": [],
        "name": "getEncryptedResults",
        "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    provider: {
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 11155111
    }
  }

  const contract = useContract(contractConfig)
  
  if (!contract.isReady) {
    throw new Error('Contract not ready')
  }

  // Read from contract
  const readOptions: ReadContractOptions = {
    functionName: 'getEncryptedResults',
    cache: true,
    cacheTime: 30000 // 30 seconds
  }

  const { data, isLoading, error, refetch } = useReadContract(contract.contract, readOptions)
  
  console.log('Contract data:', data)
  console.log('Loading:', isLoading)
  console.log('Error:', error)

  return { contract, data, isLoading, error, refetch }
}

// Example 3: Write to contract
export async function writeToContract() {
  const contractConfig: ContractHookConfig = {
    address: '0x1234567890123456789012345678901234567890',
    abi: [
      {
        "inputs": [{"internalType": "bytes", "name": "encryptedVote", "type": "bytes"}],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    provider: {
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 11155111
    }
  }

  const contract = useContract(contractConfig)
  const { write, isPending, error, hash, receipt } = useWriteContract(contract.contract, contract.contract.provider)

  // Write to contract
  const writeOptions: WriteContractOptions = {
    functionName: 'vote',
    args: ['0x1234567890abcdef'],
    privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234'
  }

  try {
    await write(writeOptions)
    console.log('Transaction hash:', hash)
    console.log('Receipt:', receipt)
  } catch (err) {
    console.error('Write error:', err)
  }

  return { write, isPending, error, hash, receipt }
}

// Example 4: Encryption
export async function encryptionExample() {
  const config: FHEVMHookConfig = {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111
  }

  const { encrypt, isPending, error, handle } = useEncrypt(config)

  try {
    const encryptedHandle = await encrypt(42, '0x1234567890123456789012345678901234567890')
    console.log('Encrypted handle:', encryptedHandle)
  } catch (err) {
    console.error('Encryption error:', err)
  }

  return { encrypt, isPending, error, handle }
}

// Example 5: Decryption
export async function decryptionExample() {
  const config: FHEVMHookConfig = {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111
  }

  const { decrypt, isPending, error, value } = useDecrypt(config)

  try {
    const decryptedValue = await decrypt({
      handle: '0x1234567890abcdef',
      contractAddress: '0x1234567890123456789012345678901234567890',
      usePublicDecrypt: true
    })
    console.log('Decrypted value:', decryptedValue)
  } catch (err) {
    console.error('Decryption error:', err)
  }

  return { decrypt, isPending, error, value }
}

// Example 6: Batch Encryption
export async function batchEncryptionExample() {
  const config: FHEVMHookConfig = {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111
  }

  const { batchEncrypt, isPending, error, handles, progress } = useBatchEncrypt(config)

  try {
    const encryptedHandles = await batchEncrypt([42, 100, 255], '0x1234567890123456789012345678901234567890')
    console.log('Batch encrypted handles:', encryptedHandles)
    console.log('Progress:', progress)
  } catch (err) {
    console.error('Batch encryption error:', err)
  }

  return { batchEncrypt, isPending, error, handles, progress }
}

// Example 7: Batch Decryption
export async function batchDecryptionExample() {
  const config: FHEVMHookConfig = {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111
  }

  const { batchDecrypt, isPending, error, values, progress } = useBatchDecrypt(config)

  try {
    const decryptedValues = await batchDecrypt({
      handles: ['0x1234567890abcdef', '0x1234567890abcdef', '0x1234567890abcdef'],
      contractAddress: '0x1234567890123456789012345678901234567890',
      usePublicDecrypt: true
    })
    console.log('Batch decrypted values:', decryptedValues)
    console.log('Progress:', progress)
  } catch (err) {
    console.error('Batch decryption error:', err)
  }

  return { batchDecrypt, isPending, error, values, progress }
}

// Example 8: Complete workflow
export async function completeWorkflow() {
  console.log('🚀 Starting complete FHEVM workflow...')

  // 1. Setup FHEVM
  await basicFHEVMSetup()
  console.log('✅ FHEVM initialized')

  // 2. Setup contract
  await contractInteraction()
  console.log('✅ Contract connected')

  // 3. Encrypt a value
  const { encrypt } = await encryptionExample()
  const encryptedHandle = await encrypt(100, '0x1234567890123456789012345678901234567890')
  console.log('✅ Value encrypted:', encryptedHandle)

  // 4. Decrypt the value
  const { decrypt } = await decryptionExample()
  const decryptedValue = await decrypt({
    handle: encryptedHandle,
    contractAddress: '0x1234567890123456789012345678901234567890',
    usePublicDecrypt: true
  })
  console.log('✅ Value decrypted:', decryptedValue)

  // 5. Batch operations
  const { batchEncrypt } = await batchEncryptionExample()
  const batchHandles = await batchEncrypt([42, 100, 255], '0x1234567890123456789012345678901234567890')
  console.log('✅ Batch encrypted:', batchHandles)

  console.log('🎉 Complete workflow finished!')
}
