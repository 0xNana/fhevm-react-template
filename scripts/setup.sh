#!/bin/bash

# Universal FHEVM SDK Complete Setup Script
# Sets up the entire development environment from scratch

set -e

echo "🚀 Setting up Universal FHEVM SDK Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root of the fhevm-react-template directory"
    exit 1
fi

# Run installation
echo "📦 Installing all packages..."
bash scripts/install.sh

# Set up environment files
echo "⚙️ Setting up environment files..."

# Copy .env.example files if they don't exist
if [ ! -f "packages/nextjs-example/.env" ]; then
    echo "  - Setting up Next.js environment..."
    cp packages/nextjs-example/.env.example packages/nextjs-example/.env
fi

if [ ! -f "packages/vue-example/.env" ]; then
    echo "  - Setting up Vue environment..."
    cp packages/vue-example/.env.example packages/vue-example/.env
fi

if [ ! -f "packages/node-example/.env" ]; then
    echo "  - Setting up Node.js environment..."
    cp packages/node-example/.env.example packages/node-example/.env
fi

# Initialize FHEVM configuration
echo "🔐 Initializing FHEVM configuration..."
pnpm fhevm-node:init

# Deploy contracts to localhost
echo "⚒️ Deploying contracts to localhost..."
pnpm hardhat:deploy

# Generate TypeScript ABIs
echo "📝 Generating TypeScript ABIs..."
pnpm generate

# Run tests to verify setup
echo "🧪 Running tests to verify setup..."
pnpm test:all

echo "✅ Complete setup finished successfully!"
echo ""
echo "🎯 Development environment ready!"
echo ""
echo "📋 What's been set up:"
echo "  ✅ All packages installed and built"
echo "  ✅ Environment files configured"
echo "  ✅ FHEVM configuration initialized"
echo "  ✅ Contracts deployed to localhost"
echo "  ✅ TypeScript ABIs generated"
echo "  ✅ All tests passing"
echo ""
echo "🚀 Start developing:"
echo "  pnpm next:dev       - Next.js frontend (http://localhost:3000)"
echo "  pnpm vue:dev        - Vue frontend (http://localhost:5173)"
echo "  pnpm cli:start      - Node.js API server (http://localhost:3002)"
echo "  pnpm fhevm-node     - Universal FHEVM CLI"
echo ""
echo "📚 Documentation:"
echo "  - Next.js: packages/nextjs-example/README.md"
echo "  - Vue: packages/vue-example/README.md"
echo "  - Node.js: packages/node-example/README.md"
echo "  - CLI: pnpm fhevm-node --help"
echo ""
echo "🎉 Happy coding!"
