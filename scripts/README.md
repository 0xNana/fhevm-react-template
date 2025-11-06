# Scripts Overview

This directory contains shell scripts for common development tasks.

## Script Purposes

### `install.sh` - Dependency Installation Only
**Purpose:** Installs all dependencies with prerequisite checks.

**What it does:**
- ✅ Checks prerequisites (pnpm, Node.js 20+)
- ✅ Installs all dependencies via `pnpm install`

**What it does NOT do:**
- ❌ Does not build packages (use `build.sh` for that)
- ❌ Does not deploy contracts

**Usage:**
```bash
bash scripts/install.sh
# or
pnpm install:all
```

---

### `build.sh` - Build All Packages
**Purpose:** Builds the SDK, examples, and contracts.

**What it does:**
- ✅ Builds Universal FHEVM SDK (`pnpm sdk:build`)
- ✅ Builds Next.js example (`pnpm next:build`)
- ✅ Builds Vue.js example (`pnpm vue:build`)
- ✅ Builds Node.js example (if available)
- ✅ Compiles Hardhat contracts (`pnpm hardhat:compile`)

**Usage:**
```bash
bash scripts/build.sh
# or
pnpm build:all
```

---

### `setup.sh` - Complete Development Setup
**Purpose:** Full setup from scratch (install + build + deploy + test).

**What it does:**
- ✅ Runs `install.sh` (installs dependencies)
- ✅ Runs `build.sh` (builds everything)
- ✅ Sets up environment files (.env)
- ✅ Initializes FHEVM CLI (if available)
- ✅ Deploys contracts to localhost
- ✅ Runs all tests

**Usage:**
```bash
bash scripts/setup.sh
# or
pnpm setup
```

---

### `deploy.sh` - Deploy Contracts & Start Services
**Purpose:** Deploys contracts and prepares the development environment.

**What it does:**
- ✅ Checks/installs dependencies if needed
- ✅ Runs `build.sh` (builds everything)
- ✅ Starts local Hardhat node (background)
- ✅ Deploys contracts to localhost
- ✅ Generates contract addresses and ABIs

**Usage:**
```bash
bash scripts/deploy.sh
# or
pnpm deploy:all
```

**Note:** This starts a Hardhat node in the background. Stop it with the PID shown.

---

### `test.sh` - Run All Tests
**Purpose:** Verifies package structure and runs Hardhat contract tests.

**What it does:**
- ✅ Verifies package structure
- ✅ Runs Hardhat contract tests (`pnpm hardhat:test`)

**Usage:**
```bash
bash scripts/test.sh
# or
pnpm test:all
```

---

### `test-cross-framework.sh` - Cross-Framework Compatibility Test
**Purpose:** Verifies the SDK works across React, Vue, and Node.js.

**What it does:**
- ✅ Builds all packages
- ✅ Tests Next.js example build
- ✅ Tests Vue.js example build
- ✅ Verifies SDK structure and exports

**Usage:**
```bash
bash scripts/test-cross-framework.sh
# or
pnpm test:cross-framework
```

---

## Script Relationships

```
install.sh
  └─> Just installs dependencies

build.sh
  └─> Builds everything (requires install.sh first)

setup.sh
  ├─> install.sh (installs)
  ├─> build.sh (builds)
  ├─> Environment setup
  ├─> Contract deployment
  └─> test.sh (verifies)

deploy.sh
  ├─> install.sh (if needed)
  ├─> build.sh (builds)
  ├─> Starts Hardhat node
  └─> Deploys contracts

test.sh
  └─> Runs tests (requires build.sh first)
```

## Quick Reference

| Task | Script | Command |
|------|--------|---------|
| Install dependencies | `install.sh` | `pnpm install:all` |
| Build everything | `build.sh` | `pnpm build:all` |
| Full setup | `setup.sh` | `pnpm setup` |
| Deploy contracts | `deploy.sh` | `pnpm deploy:all` |
| Run tests | `test.sh` | `pnpm test:all` |
| Cross-framework test | `test-cross-framework.sh` | `pnpm test:cross-framework` |

## Best Practices

1. **First time setup:** Use `setup.sh` for a complete environment
2. **After pulling changes:** Use `install.sh` then `build.sh`
3. **Before deploying:** Use `deploy.sh` to prepare contracts
4. **Quick testing:** Use `test.sh` after building

## Notes

- All scripts check if they're run from the correct directory
- Scripts use `set -e` to exit on errors
- Optional packages (like node-example) are handled gracefully
- Scripts can be run directly or via pnpm scripts in `package.json`

