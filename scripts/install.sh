#!/bin/bash

# Universal FHEVM SDK Installation Script
# Installs all packages and dependencies from root

set -e

echo "🚀 Installing Universal FHEVM SDK Enhanced Template..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root of the fhevm-react-template directory"
    exit 1
fi

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is required but not installed."
    echo "   Install it with: npm install -g pnpm"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    echo "   Install it from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install all dependencies
echo "📦 Installing all dependencies..."
pnpm install

echo "✅ Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  pnpm build:all      - Build all packages"
echo "  pnpm quickstart     - Quick setup with FHEVM CLI"
echo "  pnpm examples       - Show all available examples"
echo "  pnpm deploy:sepolia - Deploy contracts to Sepolia"
echo "  pnpm generate       - Generate TypeScript contract definitions"
echo "  pnpm fhevm-cli      - Universal FHEVM CLI"
echo "  pnpm fhevm:wizard   - Universal FHEVM Wizard"
echo "  pnpm next:dev       - Start Next.js example"
echo "  pnpm vue:dev        - Start Vue example"
echo "  pnpm node:dev       - Start Node.js example"
