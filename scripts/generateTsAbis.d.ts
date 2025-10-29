/**
 * DON'T MODIFY OR DELETE THIS SCRIPT (unless you know what you're doing)
 *
 * This script generates the file containing the contracts Abi definitions.
 * These definitions are used to derive the types needed in the custom fhevm hooks, for example.
 * This script should run as the last deploy script.
 */
/**
 * Generates the TypeScript contract definition file based on the json output of the contract deployment scripts
 * This script should be run last.
 */
declare const generateTsAbis: () => Promise<void>;
export default generateTsAbis;
