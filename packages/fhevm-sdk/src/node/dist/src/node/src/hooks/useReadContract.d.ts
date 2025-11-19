import type { ReadContractOptions, ReadContractResult } from './types.js';
/**
 * Read contract hook for Node.js
 *
 * Provides a React-like hook interface for reading from contracts.
 * Similar to wagmi's useReadContract but for Node.js environments.
 */
export declare function useReadContract<T = any>(contract: any, options: ReadContractOptions): ReadContractResult<T>;
//# sourceMappingURL=useReadContract.d.ts.map