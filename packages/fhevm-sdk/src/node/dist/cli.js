#!/usr/bin/env node
import { program } from "commander";
import { createFHEVMClientForNode, encryptValue, decryptValue } from "./utilities.js";
/**
 * FHEVM CLI Tool
 *
 * Command-line interface for FHEVM operations in Node.js environments.
 */
// CLI configuration
const cliConfig = {
    rpcUrl: process.env.RPC_URL || "https://sepolia.infura.io/v3/",
    chainId: parseInt(process.env.CHAIN_ID || "11155111"),
    mockChains: {
        31337: "http://localhost:8545"
    }
};
// Encrypt command
program
    .command("encrypt")
    .description("Encrypt a value using FHEVM")
    .requiredOption("-v, --value <number>", "Value to encrypt")
    .requiredOption("-k, --public-key <string>", "Public key for encryption")
    .option("-c, --contract <string>", "Contract address")
    .action(async (options) => {
    try {
        console.log(`🔐 Encrypting value: ${options.value}`);
        const encrypted = await encryptValue(parseInt(options.value), options.publicKey, cliConfig);
        console.log(`✅ Encrypted: ${encrypted}`);
    }
    catch (error) {
        console.error(`❌ Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
});
// Decrypt command
program
    .command("decrypt")
    .description("Decrypt a handle using FHEVM")
    .requiredOption("-h, --handle <string>", "Encrypted handle to decrypt")
    .requiredOption("-c, --contract <string>", "Contract address")
    .option("-s, --signature <string>", "User signature for userDecrypt")
    .option("-p, --public", "Use public decryption (no signature required)")
    .action(async (options) => {
    try {
        console.log(`🔓 Decrypting handle: ${options.handle}`);
        const decrypted = await decryptValue(options.handle, options.contract, cliConfig, {
            ...(options.signature && { signature: options.signature }),
            usePublicDecrypt: options.public || false
        });
        console.log(`✅ Decrypted: ${decrypted}`);
    }
    catch (error) {
        console.error(`❌ Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
});
// Status command
program
    .command("status")
    .description("Check FHEVM client status")
    .action(async () => {
    try {
        console.log("🔧 Checking FHEVM client status...");
        const client = createFHEVMClientForNode(cliConfig);
        await client.initialize();
        const state = client.getState();
        console.log(`📊 Status: ${state.status}`);
        console.log(`✅ Ready: ${client.isReady()}`);
        console.log(`❌ Error: ${state.error?.message || "None"}`);
    }
    catch (error) {
        console.error(`❌ Status check failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
});
// Parse command line arguments
program.parse();
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
// Default export for the CLI program
export default program;
//# sourceMappingURL=cli.js.map