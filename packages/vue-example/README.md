# Vue 3 Example - FHEVM SDK

This Vue 3 application demonstrates the FHEVM SDK with modern Vue patterns and Composition API.

##  Features

### **Vue 3 + Composition API**
- **Modern Vue Patterns**: Composition API, reactive refs, computed properties
- **TypeScript First**: Full type safety throughout the application
- **Vite Build System**: Fast development and building
- **Tailwind CSS**: Modern, responsive styling

### **Three Comprehensive Demos**
1. **Counter Demo**: Encrypted counter operations
2. **Bank Demo**: Confidential banking with deposits, withdrawals, transfers
3. **Voting Demo**: Confidential voting with sessions and encrypted results

### **FHEVM SDK Integration**
- **Vue Composables**: `useFHEVM`, `useEncryption`, `useDecryption`
- **Reactive State**: Real-time FHEVM client state monitoring
- **Error Handling**: Comprehensive error states and messages
- **Wallet Integration**: wagmi integration for wallet connection

##  Architecture

### **Vue Composables**
```typescript
// FHEVM composable
import { useFHEVM } from '@/composables/useFHEVM'

const { 
  state, 
  isConnected, 
  hasError, 
  statusMessage, 
  statusColor 
} = useFHEVM(config)

// Encryption composable
import { useEncryption } from '@fhevm/sdk/vue'

const { 
  encrypt, 
  data: encryptedData, 
  isEncrypting, 
  error: encryptError 
} = useEncryption(state, options)

// Decryption composable
import { useDecryption } from '@fhevm/sdk/vue'

const { 
  decrypt, 
  data: decryptedData, 
  isDecrypting, 
  error: decryptError 
} = useDecryption(state, options)
```

### **Vue Router Integration**
```typescript
// Routes
const routes = [
  { path: '/counter', component: CounterDemo, name: 'Counter' },
  { path: '/bank', component: BankDemo, name: 'Bank' },
  { path: '/voting', component: VotingDemo, name: 'Voting' }
]
```

### **Pinia State Management**
```typescript
// Store setup
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)
```

##  Dependencies

### **Core Dependencies**
- `@fhevm/sdk` - Universal FHEVM SDK
- `vue` - Vue 3 framework
- `vue-router` - Vue routing
- `pinia` - State management

### **Build Dependencies**
- `vite` - Build tool
- `@vitejs/plugin-vue` - Vue plugin for Vite
- `typescript` - TypeScript support
- `tailwindcss` - Styling

### **Web3 Dependencies**
- `wagmi` - Ethereum React hooks
- `viem` - Ethereum library
- `@rainbow-me/rainbowkit` - Wallet connection

##  Quick Start

### **1. Install Dependencies**
```bash
pnpm install
```

### **2. Build Universal SDK**
```bash
pnpm build:all
```

### **3. Start Development**
```bash
# Terminal 1: Start local Hardhat node
pnpm chain

# Terminal 2: Deploy contracts
pnpm deploy:localhost

# Terminal 3: Start Vue app
pnpm dev
```

### **4. Open Application**
Navigate to [http://localhost:3001](http://localhost:3001)

##  Demo Features

### **Enhanced Counter Demo**
- **Increment/Decrement**: Encrypted counter operations
- **Real-time Status**: FHEVM client state monitoring
- **Error Handling**: Comprehensive error states
- **Modern UI**: Beautiful, responsive interface

### **FHE Bank Demo**
- **Deposit**: Encrypt and deposit amounts
- **Withdraw**: Encrypt and withdraw amounts
- **Transfer**: Send encrypted amounts to other users
- **Balance**: View and decrypt encrypted balances

### **FHE Voting Demo**
- **Create Sessions**: Start new voting sessions
- **Cast Votes**: Vote yes/no with encryption
- **View Results**: Decrypt encrypted voting results
- **Session Management**: End and monitor sessions

##  Configuration

### **Environment Variables**
```bash
# Required for production
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# Optional
VITE_INFURA_API_KEY=your_infura_key
```

### **Network Configuration**
- **Local Development**: Hardhat (Chain ID: 31337)
- **Testnet**: Sepolia (Chain ID: 11155111)
- **Mock Chains**: Localhost for development

##  User Interface

### **Navigation**
- **Router-based Navigation**: Clean URL routing
- **Visual Indicators**: Clear active state indicators
- **Responsive Design**: Works on all screen sizes

### **Status Monitoring**
- **FHEVM Status**: Real-time client state
- **Wallet Status**: Connection and chain information
- **Error States**: Clear error messages and handling

### **Operations**
- **Form-based Input**: Intuitive user inputs
- **Loading States**: Visual feedback during operations
- **Results Display**: Clear output formatting

##  Bounty Requirements

### ** Framework Agnostic**
- Core SDK works in React, Vue, and Node.js
- Vue-specific composables for native Vue experience
- Clean separation of concerns

### ** Wagmi-like Structure**
- Familiar composable patterns
- Intuitive API design
- TypeScript-first approach

### ** Quick Setup**
- <10 lines of code to get started
- Zero-config defaults
- Comprehensive documentation

### ** Full FHEVM Flow**
- Initialize, encrypt, decrypt operations
- Contract interactions
- Error handling and edge cases

### ** Multiple Examples**
- Three comprehensive demos
- Real-world use cases
- Production-ready implementation

##  Deployment

### **Vite Build**
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### **Deployment Options**

#### **Netlify**
- Drag and drop `dist` folder or connect GitHub repository
- The `public/_redirects` file is automatically copied to `dist/_redirects` during build
- This ensures Vue Router routes work correctly (no 404 errors)

#### **Vercel**
- Connect GitHub repository
- The `vercel.json` file automatically:
  - Builds the SDK before building the Vue app
  - Configures rewrites for Vue Router (all routes → `/index.html`)
  - Sets the output directory to `dist`
- Routes like `/counter`, `/bank`, `/voting` will work correctly

#### **Apache Server**
- Deploy `dist` folder to your Apache server
- The `public/.htaccess` file is automatically copied to `dist/.htaccess` during build
- Ensure `mod_rewrite` is enabled on your Apache server

#### **Nginx**
- Use the provided `nginx.conf` as a reference
- Configure your nginx server block with the `try_files` directive
- See `nginx.conf` in the project root for the configuration

### **Environment Setup**
1. Set `VITE_ALCHEMY_API_KEY`
2. Update contract addresses in configuration
3. Configure RPC URLs for production

### **Important: Routing Configuration**

For Vue Router to work correctly in production, you need to configure your server to serve `index.html` for all routes. This prevents 404 errors when navigating directly to routes like `/counter`, `/bank`, or `/voting`.

**Files included for different hosting providers:**
- `public/_redirects` - For Netlify (automatically copied to `dist/`)
- `vercel.json` - For Vercel (in project root)
- `public/.htaccess` - For Apache (automatically copied to `dist/`)
- `nginx.conf` - Reference configuration for Nginx

## 📚 Documentation

- [FHEVM SDK Documentation](../fhevm-sdk/README.md)
- [Next.js Example](../nextjs-example/README.md)
- [Node.js Example](../node-example/README.md)

## 🤝 Contributing

This project is part of the Zama FHEVM Bounty Program. See the main repository for contribution guidelines.

## 📄 License

BSD-3-Clause-Clear License
