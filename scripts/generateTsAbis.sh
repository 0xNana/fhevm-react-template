#!/bin/bash

# Universal FHEVM SDK Generate TypeScript ABIs Script
# Generates TypeScript contract definitions from deployment files

set -e

echo "📝 Generating TypeScript contract definitions..."

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

# Compile contracts first (needed for artifacts)
echo "🔨 Compiling contracts..."
pnpm hardhat:compile

# Check if artifacts directory exists
if [ ! -d "packages/hardhat/artifacts" ] || [ -z "$(ls -A packages/hardhat/artifacts 2>/dev/null)" ]; then
    echo "❌ Error: Artifacts directory not found or empty."
    echo "   Please compile contracts first using: pnpm hardhat:compile"
    exit 1
fi

# Run the TypeScript generator
echo "📝 Generating TypeScript contract definitions..."
pnpm generate

echo ""
echo "✅ TypeScript contract definitions generated successfully!"
echo ""
echo "📋 Generated contract files (in each example directory):"
echo "  - FHECounter.ts"
echo "  - FHEVoting.ts"
echo "  - FHEBank.ts"
echo ""
echo "📁 Target directories:"
echo "  - packages/nextjs-example/contracts/"
echo "  - packages/vue-example/src/contracts/"
echo "  - packages/node-example/src/contracts/"
echo ""
echo "🎯 Each contract file contains ABIs and addresses for all chain IDs."
echo "   This allows generating types even before contracts are deployed on actual chains."
echo "   Run scripts/deploy.sh to deploy contracts and update addresses."
echo "   If deployments exist, addresses will be included; otherwise placeholder addresses are used."

