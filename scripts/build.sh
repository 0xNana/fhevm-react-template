#!/bin/bash

# Universal FHEVM SDK Build Script
# Builds all packages and examples for the enhanced FHEVM template

set -e

echo "🚀 Building Universal FHEVM SDK Enhanced Template..."

# Clean and build the Universal FHEVM SDK packages
echo "📦 Building Universal FHEVM SDK packages..."

pnpm sdk:build

# Build the examples
echo "🎨 Building examples..."
echo "  - Building Next.js example..."
pnpm next:build

echo "  - Building Vue.js example..."
pnpm vue:build

echo "  - Building Node.js example..."
pnpm node:build

# Build the Hardhat contracts
echo "🔨 Building Hardhat contracts..."
pnpm hardhat:compile

echo "✅ All builds completed successfully!"
echo ""
echo "📋 Built packages:"
echo "  - @fhevm/sdk (Universal FHEVM SDK)"
echo "  - @fhevm/node (Node.js utilities & CLI)"
echo "  - Next.js example"
echo "  - Vue.js example"
echo "  - Node.js example"
echo "  - Hardhat contracts"
echo ""
echo "🚀 Available commands:"
echo "  pnpm fhevm-node     - Universal FHEVM CLI"
echo "  pnpm next:dev       - Start Next.js example"
echo "  pnpm vue:dev        - Start Vue example"
echo "  pnpm cli:start      - Start Node.js API server"
echo ""
echo "🎯 Ready for deployment and testing!"
