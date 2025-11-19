import { ethers } from 'ethers';
/**
 * Write contract hook for Node.js
 *
 * Provides a React-like hook interface for writing to contracts.
 * Similar to wagmi's useWriteContract but for Node.js environments.
 */
export function useWriteContract(contract, provider) {
    let isPending = false;
    let error = null;
    let hash = null;
    let receipt = null;
    const write = async (options = {}) => {
        if (!contract) {
            error = new Error('Contract not available');
            throw error;
        }
        if (!options.privateKey) {
            error = new Error('Private key is required for write operations');
            throw error;
        }
        isPending = true;
        error = null;
        hash = null;
        receipt = null;
        try {
            // Create wallet from private key
            const wallet = new ethers.Wallet(options.privateKey, provider);
            const contractWithSigner = contract.connect(wallet);
            // Prepare transaction options
            const txOptions = {};
            if (options.value)
                txOptions.value = options.value;
            if (options.gasLimit)
                txOptions.gasLimit = options.gasLimit;
            if (options.gasPrice)
                txOptions.gasPrice = options.gasPrice;
            if (options.maxFeePerGas)
                txOptions.maxFeePerGas = options.maxFeePerGas;
            if (options.maxPriorityFeePerGas)
                txOptions.maxPriorityFeePerGas = options.maxPriorityFeePerGas;
            // Execute transaction
            const tx = await contractWithSigner[options.functionName](...(options.args || []), txOptions);
            hash = tx.hash;
            receipt = await tx.wait();
            isPending = false;
            return receipt;
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            isPending = false;
            throw error;
        }
    };
    const reset = () => {
        isPending = false;
        error = null;
        hash = null;
        receipt = null;
    };
    return {
        write,
        isPending,
        error,
        hash,
        receipt,
        reset
    };
}
//# sourceMappingURL=useWriteContract.js.map