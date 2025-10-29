#!/bin/bash

# Universal FHEVM SDK Deploy Script
# Deploys contracts and starts the development environment

set -e

echo "🚀 Deploying Universal FHEVM SDK Enhanced Template..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root of the fhevm-react-template directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build everything first
echo "🔨 Building all packages..."
./scripts/build.sh

# Start local Hardhat node in background
echo "⛓️ Starting local Hardhat node..."
pnpm hardhat:chain &
HARDHAT_PID=$!

# Wait for Hardhat to start
echo "⏳ Waiting for Hardhat node to start..."
sleep 10

# Deploy contracts to localhost
echo "📋 Deploying contracts to localhost..."
pnpm hardhat:deploy

# Generate contract addresses and ABIs
echo "📝 Generating contract addresses and ABIs..."
pnpm generate

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Available services:"
echo "  - Hardhat node: http://127.0.0.1:8545 (Chain ID: 31337)"
echo "  - Next.js example: http://localhost:3000 (run 'pnpm next:dev')"
echo "  - Vue.js example: http://localhost:5173 (run 'pnpm vue:dev')"
echo "  - Node.js API: http://localhost:3002 (run 'pnpm cli:start')"
echo ""
echo "📋 Contract addresses saved to:"
echo "  - packages/nextjs-example/contracts/deployedContracts.ts"
echo "  - packages/vue-example/contracts/addresses.ts"
echo "  - packages/node-example/contracts/addresses.ts"
echo ""
echo "🚀 Available commands:"
echo "  pnpm fhevm-node     - Universal FHEVM CLI"
echo "  pnpm next:dev       - Start Next.js example"
echo "  pnpm vue:dev        - Start Vue example"
echo "  pnpm cli:start      - Start Node.js API server"
echo ""
echo "🎯 Next steps:"
echo "  1. Start an example: pnpm next:dev"
echo "  2. Or use the CLI: pnpm fhevm-node"
echo "  3. Connect MetaMask to http://127.0.0.1:8545"
echo "  4. Import the Hardhat account for testing"
echo ""
echo "💡 To stop the Hardhat node, run: kill $HARDHAT_PID"
