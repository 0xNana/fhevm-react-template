#!/bin/bash

# Universal FHEVM SDK Deploy Script
# Deploys contracts to Sepolia testnet

set -e

echo "🚀 Deploying Universal FHEVM SDK Contracts to Sepolia..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root of the fhevm-react-template directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Error: Dependencies not installed. Please run 'pnpm install' first."
    exit 1
fi

# Check if contracts are compiled
if [ ! -d "packages/hardhat/artifacts" ] || [ -z "$(ls -A packages/hardhat/artifacts 2>/dev/null)" ]; then
    echo "❌ Error: Contracts not compiled. Please run 'pnpm hardhat:compile' or 'pnpm build:all' first."
    exit 1
fi

# Check for required Hardhat variables
echo "📋 Checking required configuration..."
echo "   Note: Make sure you have set MNEMONIC and INFURA_API_KEY using 'npx hardhat vars set'"
echo "   Or configure them in your .env file for Hardhat to read"

# Deploy contracts to Sepolia
echo "📋 Deploying contracts to Sepolia testnet..."
pnpm hardhat:deploy:sepolia

echo "✅ Deployment to Sepolia completed successfully!"
echo ""
echo "🌐 Network Information:"
echo "  - Network: Sepolia Testnet"
echo "  - Chain ID: 11155111"
echo "  - Explorer: https://sepolia.etherscan.io"
echo ""
echo "📋 Deployment files saved to:"
echo "  - packages/hardhat/deployments/sepolia/"
echo ""
echo "🔍 Verify your contracts:"
echo "  - Run 'pnpm verify:sepolia' to verify on Etherscan"
echo ""
echo "📝 Generate TypeScript definitions:"
echo "  - Run 'bash scripts/generateTsAbis.sh' or 'pnpm generate' to generate contract ABIs"
echo ""
echo "🚀 Available commands:"
echo "  pnpm fhevm-cli     - Universal FHEVM CLI"
echo "  pnpm fhevm:wizard     - Universal FHEVM Wizard"
echo "  pnpm next:dev      - Start Next.js example"
echo "  pnpm vue:dev       - Start Vue example"
echo "  pnpm examples      - Show all examples"
echo "  pnpm quickstart    - Quickstart FHEVM"
echo ""
echo "🎯 Next steps:"
echo "  1. Generate TypeScript definitions: bash scripts/generateTsAbis.sh"
echo "  2. Update your frontend .env files with the new contract addresses"
echo "  3. Connect MetaMask to Sepolia testnet (Chain ID: 11155111)"
echo "  4. Get Sepolia ETH from a faucet if needed"
echo "  5. Start testing: pnpm next:dev or pnpm vue:dev"
