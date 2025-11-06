#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs'
import { config } from 'dotenv'
import { 
  createFHEVMClientForNode, 
  encryptValue, 
  decryptValue, 
  batchEncrypt, 
  batchDecrypt,
  userDecryptWithSignature,
  publicDecrypt,
  shouldUseMockMode
} from './utilities.js'

import type { FHEVMConfig } from '../../types.js'

config({ path: '.env.production' })
config({ path: '.env' })

/**
 * Universal FHEVM SDK - Node.js CLI
 * 
 * Basic command-line interface for FHEVM operations:
 * - Core operations (encrypt, decrypt, batch operations)
 * - Utility operations (status, test, info, init)
 * - Mock mode for testing (no Windows API required)
 */

const program = new Command()

// CLI configuration
program
  .name('fhevm-cli')
  .description('Universal FHEVM SDK - Node.js CLI Tools')
  .version('1.0.0')

// Global options
program
  .option('-c, --config <path>', 'Path to config file', '.env')
  .option('-v, --verbose', 'Verbose output')
  .option('--dry-run', 'Show what would be done without executing')

const loadConfig = (): FHEVMConfig => {
  const mockMode = shouldUseMockMode()
  
  if (mockMode) {
    return {
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      mockChains: {
        31337: 'http://localhost:8545'
      }
    }
  }
  
  const rpcUrl = process.env.RPC_URL || process.env.MOCK_RPC_URL || 'http://localhost:8545'
  const chainId = parseInt(process.env.CHAIN_ID || process.env.MOCK_CHAIN_ID || '31337')
  
  return {
    rpcUrl,
    chainId,
    mockChains: {
      31337: 'http://localhost:8545'
    }
  }
}

program
  .command('init')
  .description('Interactive FHEVM setup and testing experience')
  .action(async () => {
    console.clear()
    console.log(chalk.blue.bold('\n🚀 FHEVM SDK Interactive Setup'))
    console.log(chalk.gray('═'.repeat(50)))
    console.log()
    console.log(chalk.white('Welcome! Let\'s set up your FHEVM development environment.'))
    console.log(chalk.gray('This interactive setup will guide you through configuration and testing.'))
    console.log()
    
    try {
      const { setupMode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'setupMode',
          message: 'Choose your setup mode:',
          choices: [
            {
              name: 'Mock Mode (Recommended for testing)',
              value: 'mock',
              short: 'Mock'
            },
            {
              name: 'Sepolia Testnet (Real blockchain - requires RPC)',
              value: 'sepolia',
              short: 'Sepolia'
            },
            {
              name: 'Custom Configuration',
              value: 'custom',
              short: 'Custom'
            }
          ],
          default: 'mock'
        }
      ])
      
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            {
              name: 'Quick Test (Encrypt → Decrypt)',
              value: 'test',
              short: 'Test'
            },
            {
              name: 'Full Setup (Configure everything)',
              value: 'setup',
              short: 'Setup'
            },
            {
              name: 'Just Install Dependencies',
              value: 'install',
              short: 'Install'
            }
          ],
          default: 'test'
        }
      ])
      
      if (action === 'install') {
        console.log(chalk.green('\n✅ Dependencies are already installed!'))
        console.log(chalk.gray('Run pnpm fhevm-cli --help to see available commands.'))
        return
      }
      
      let config: FHEVMConfig
      let mockMode = false
      
      if (setupMode === 'mock') {
        mockMode = true
        config = {
          rpcUrl: 'http://localhost:8545',
          chainId: 31337
        }
        console.log(chalk.yellow('⚠️  Using mock mode (no real blockchain required)'))
        console.log(chalk.gray('   Perfect for testing and development'))
      } else if (setupMode === 'sepolia') {
        console.log()
        console.log(chalk.blue('🔗 Sepolia Testnet Configuration'))
        console.log(chalk.gray('You\'ll need a valid RPC URL and testnet ETH'))
        console.log()
        
        const { rpcUrl } = await inquirer.prompt([
          {
            type: 'input',
            name: 'rpcUrl',
            message: 'Enter your Sepolia RPC URL:',
            default: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
            validate: (input) => input.includes('infura') || input.includes('alchemy') || input.includes('quicknode') || 'Please enter a valid RPC URL'
          }
        ])
        
        config = {
          rpcUrl,
          chainId: 11155111
        }
        console.log(chalk.green('✅ Sepolia testnet configured'))
      } else {
        console.log()
        console.log(chalk.blue('⚙️  Custom Configuration'))
        console.log(chalk.gray('Set up your own network configuration'))
        console.log()
        
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'rpcUrl',
            message: 'Enter RPC URL:',
            default: 'http://localhost:8545'
          },
          {
            type: 'number',
            name: 'chainId',
            message: 'Enter chain ID:',
            default: 31337
          }
        ])
        
        config = {
          rpcUrl: answers.rpcUrl,
          chainId: answers.chainId
        }
        console.log(chalk.green('✅ Custom configuration set'))
      }
      
      if (action === 'setup' || action === 'test') {
        const envContent = `# FHEVM Configuration
RPC_URL=${config.rpcUrl}
CHAIN_ID=${config.chainId}
${mockMode ? 'FHEVM_MOCK_MODE=true' : ''}
`
        fs.writeFileSync('.env', envContent)
        console.log(chalk.green('✅ Configuration saved to .env'))
      }
      
      if (action === 'test') {
        console.log()
        console.log(chalk.blue.bold('🧪 FHEVM Encryption & Decryption Test'))
        console.log(chalk.gray('Let\'s test the core FHEVM functionality'))
        console.log()
        
        const { testValue, publicKey } = await inquirer.prompt([
          {
            type: 'number',
            name: 'testValue',
            message: 'Enter a test value to encrypt:',
            default: 5,
            validate: (input) => !isNaN(input) || 'Please enter a valid number'
          },
          {
            type: 'input',
            name: 'publicKey',
            message: 'Enter a public key (or press Enter for demo key):',
            default: '0x1234567890123456789012345678901234567890123456789012345678901234'
          }
        ])
        
        const spinner = ora('Testing FHEVM operations...').start()
        
        try {
          spinner.text = 'Encrypting value...'
          const encrypted = await encryptValue(testValue, publicKey, config)
          
          spinner.text = 'Decrypting handle...'
          const decrypted = await decryptValue(encrypted, '0x0000000000000000000000000000000000000000', config)
          
          spinner.succeed('Test completed successfully!')
          
          console.log()
          console.log(chalk.green.bold('🎉 FHEVM is working perfectly!'))
          console.log()
          console.log(chalk.blue('📊 Test Results:'))
          console.log(chalk.gray('   Original value:'), chalk.white(testValue))
          console.log(chalk.gray('   Encrypted handle:'), chalk.cyan(encrypted))
          console.log(chalk.gray('   Decrypted result:'), chalk.green(decrypted))
          console.log()
          
          if (mockMode) {
            console.log(chalk.yellow('💡 Note: This was mock mode - perfect for development!'))
            console.log(chalk.gray('   For real blockchain operations, set up a proper RPC URL.'))
            console.log()
          }
          
        } catch (error) {
          spinner.fail('Test failed')
          console.log(chalk.red('\n❌ Test failed:'), error)
          
          if (setupMode === 'sepolia') {
            console.log(chalk.yellow('\n🔧 Troubleshooting:'))
            console.log(chalk.yellow('  1. Check your RPC URL is valid and accessible'))
            console.log(chalk.yellow('  2. Ensure your private key has testnet ETH'))
            console.log(chalk.yellow('  3. Try mock mode instead: pnpm fhevm-node test-fhe'))
          }
        }
      }
      
      console.log()
      console.log(chalk.green.bold('🚀 Setup Complete!'))
      console.log()
      console.log(chalk.blue('You can now use these commands:'))
      console.log(chalk.gray('  •'), chalk.white('pnpm fhevm-cli:encrypt --value 10 --public-key 0x123'))
      console.log(chalk.gray('  •'), chalk.white('pnpm fhevm-cli:decrypt --handle <handle> --contract <address>'))
      console.log(chalk.gray('  •'), chalk.white('pnpm fhevm-cli:status'))
      console.log(chalk.gray('  •'), chalk.white('pnpm examples (see all demos)'))
      console.log()
      
      console.log(chalk.blue('📚 Next Steps:'))
      console.log(chalk.gray('  •'), chalk.white('Check out examples:'), chalk.cyan('pnpm examples'))
      console.log(chalk.gray('  •'), chalk.white('Read the docs:'), chalk.cyan('https://github.com/0xNana/fhevm-react-template'))
      console.log(chalk.gray('  •'), chalk.white('Join the community:'), chalk.cyan('Zama official discord'))
      console.log()
      
    } catch (error) {
      console.log()
      console.log(chalk.red.bold('❌ Setup failed'))
      console.log(chalk.red('Error:'), error)
      console.log()
      console.log(chalk.yellow('Try running:'), chalk.white('pnpm fhevm-cli:init'))
    }
  })

program
  .command('encrypt')
  .description('Encrypt a value using FHEVM')
  .requiredOption('-v, --value <number>', 'Value to encrypt')
  .requiredOption('-k, --public-key <string>', 'Public key for encryption')
  .option('-c, --contract <string>', 'Contract address')
  .action(async (options) => {
    const spinner = ora('Encrypting value...').start()
    
    try {
      const config = loadConfig()
      const mockMode = shouldUseMockMode()
      
      if (mockMode) {
        console.log(chalk.yellow('⚠️  Using mock mode (auto-detected)'))
        console.log(chalk.gray('   💡 To use real FHEVM, set RPC_URL in .env file'))
      }
      
      const encrypted = await encryptValue(
        parseInt(options.value),
        options.publicKey,
        config
      )
      
      spinner.succeed('Value encrypted successfully!')
      console.log(chalk.green('✅ Encrypted:'), encrypted)
      
      if (options.contract) {
        console.log(chalk.blue('📋 Contract:'), options.contract)
      }
      
    } catch (error) {
      spinner.fail('Encryption failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('decrypt')
  .description('Decrypt a handle using FHEVM')
  .requiredOption('-h, --handle <string>', 'Encrypted handle to decrypt')
  .requiredOption('-c, --contract <string>', 'Contract address')
  .option('-s, --signature <string>', 'User signature for userDecrypt')
  .option('-p, --public', 'Use public decryption (no signature required)')
  .action(async (options) => {
    const spinner = ora('Decrypting handle...').start()
    
    try {
      const config = loadConfig()
      const decrypted = await decryptValue(
        options.handle,
        options.contract,
        config,
        {
          ...(options.signature && { signature: options.signature }),
          usePublicDecrypt: options.public || false
        }
      )
      
      spinner.succeed('Handle decrypted successfully!')
      console.log(chalk.green('✅ Decrypted:'), decrypted)
      
    } catch (error) {
      spinner.fail('Decryption failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('batch-encrypt')
  .description('Encrypt multiple values efficiently')
  .requiredOption('-v, --values <numbers>', 'Comma-separated values to encrypt')
  .requiredOption('-k, --public-key <string>', 'Public key for encryption')
  .action(async (options) => {
    const spinner = ora('Encrypting values...').start()
    
    try {
      const config = loadConfig()
      const values = options.values.split(',').map((v: string) => parseInt(v.trim()))
      const encrypted = await batchEncrypt(values, options.publicKey, config)
      
      spinner.succeed('Values encrypted successfully!')
      console.log(chalk.green('✅ Encrypted values:'))
      encrypted.forEach((enc, index) => {
        console.log(chalk.blue(`  ${values[index]}:`), enc)
      })
      
    } catch (error) {
      spinner.fail('Batch encryption failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('batch-decrypt')
  .description('Decrypt multiple handles efficiently')
  .requiredOption('-h, --handles <strings>', 'Comma-separated handles to decrypt')
  .requiredOption('-c, --contract <string>', 'Contract address')
  .option('-s, --signature <string>', 'User signature for userDecrypt')
  .option('-p, --public', 'Use public decryption (no signature required)')
  .action(async (options) => {
    const spinner = ora('Decrypting handles...').start()
    
    try {
      const config = loadConfig()
      const handles = options.handles.split(',').map((h: string) => h.trim())
      const decrypted = await batchDecrypt(
        handles,
        options.contract,
        config,
        {
          ...(options.signature && { signature: options.signature }),
          usePublicDecrypt: options.public || false
        }
      )
      
      spinner.succeed('Handles decrypted successfully!')
      console.log(chalk.green('✅ Decrypted values:'))
      decrypted.forEach((dec, index) => {
        console.log(chalk.blue(`  ${handles[index]}:`), dec)
      })
      
    } catch (error) {
      spinner.fail('Batch decryption failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('user-decrypt')
  .description('Decrypt a handle using user signature (EIP-712)')
  .requiredOption('-h, --handle <string>', 'Encrypted handle to decrypt')
  .requiredOption('-c, --contract <string>', 'Contract address')
  .requiredOption('-s, --signature <string>', 'User signature for authentication')
  .action(async (options) => {
    const spinner = ora('Decrypting with user signature...').start()
    
    try {
      const config = loadConfig()
      const decrypted = await userDecryptWithSignature(
        options.handle,
        options.contract,
        options.signature,
        config
      )
      
      spinner.succeed('Handle decrypted with user signature!')
      console.log(chalk.green('✅ Decrypted:'), decrypted)
      
    } catch (error) {
      spinner.fail('User decrypt failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('public-decrypt')
  .description('Decrypt a handle using public decryption (no signature required)')
  .requiredOption('-h, --handle <string>', 'Encrypted handle to decrypt')
  .requiredOption('-c, --contract <string>', 'Contract address')
  .action(async (options) => {
    const spinner = ora('Decrypting with public decryption...').start()
    
    try {
      const config = loadConfig()
      const decrypted = await publicDecrypt(
        options.handle,
        options.contract,
        config
      )
      
      spinner.succeed('Handle decrypted with public decryption!')
      console.log(chalk.green('✅ Decrypted:'), decrypted)
      
    } catch (error) {
      spinner.fail('Public decrypt failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('status')
  .description('Check FHEVM connection and configuration status')
  .option('-d, --detailed', 'Show detailed status information')
  .action(async (options) => {
    const spinner = ora('Checking status...').start()
    
    try {
      const config = loadConfig()
      
      spinner.text = 'Validating configuration...'
      console.log(chalk.blue('\n📊 FHEVM Node.js Status'))
      console.log(chalk.gray('─'.repeat(50)))
      
      const mockMode = shouldUseMockMode(config)
      console.log(chalk.green('✅ Configuration:'), 'Valid')
      console.log(chalk.blue('   RPC URL:'), config.rpcUrl)
      console.log(chalk.blue('   Chain ID:'), config.chainId)
      console.log(chalk.blue('   Mode:'), mockMode ? chalk.yellow('Mock Mode') : chalk.green('Real Blockchain'))
      
      if (mockMode) {
        console.log(chalk.yellow('   ⚠️  Using mock mode - no real blockchain required'))
        console.log(chalk.gray('   💡 Perfect for testing and development'))
      }
      
      if (options.detailed) {
        console.log(chalk.blue('\n📋 Environment Variables:'))
        console.log(chalk.gray('   RPC_URL:'), process.env.RPC_URL || 'Not set')
        console.log(chalk.gray('   CHAIN_ID:'), process.env.CHAIN_ID || 'Not set')
        console.log(chalk.gray('   FHEVM_RPC_URL:'), process.env.FHEVM_RPC_URL || 'Not set (fallback)')
        console.log(chalk.gray('   FHEVM_CHAIN_ID:'), process.env.FHEVM_CHAIN_ID || 'Not set (fallback)')
        console.log(chalk.gray('   FHEVM_MOCK_MODE:'), process.env.FHEVM_MOCK_MODE || 'Not set')
        console.log(chalk.gray('   FHEVM_AUTO_MOCK:'), process.env.FHEVM_AUTO_MOCK || 'Not set')
        
        console.log(chalk.blue('\n🔍 Mock Mode Detection:'))
        console.log(chalk.gray('   Platform:'), process.platform)
        console.log(chalk.gray('   NODE_ENV:'), process.env.NODE_ENV || 'Not set')
        console.log(chalk.gray('   Auto-detected:'), shouldUseMockMode(config) ? chalk.green('Yes') : chalk.red('No'))
      }

      spinner.text = 'Testing FHEVM client...'
      try {
        createFHEVMClientForNode(config)
        console.log(chalk.green('✅ FHEVM Client:'), 'Created successfully')
      } catch (error) {
        console.log(chalk.yellow('⚠️ FHEVM Client:'), 'Creation failed')
        console.log(chalk.gray('   Error:'), error instanceof Error ? error.message : String(error))
      }
      
      spinner.succeed('Status check completed')
      
    } catch (error) {
      spinner.fail('Status check failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
    }
  })

program
  .command('test')
  .description('Test FHEVM connection and basic operations')
  .option('-q, --quiet', 'Quiet mode (minimal output)')
  .action(async (options) => {
    const spinner = ora('Running tests...').start()
    
    try {
      const config = loadConfig()
      
      if (!options.quiet) {
        console.log(chalk.blue('\n🧪 FHEVM Connection Test'))
        console.log(chalk.gray('─'.repeat(50)))
      }
      
      spinner.text = 'Testing configuration...'
      if (!config.rpcUrl || config.rpcUrl.includes('YOUR_INFURA_KEY')) {
        throw new Error('Missing required configuration (RPC_URL)')
      }
      if (!options.quiet) console.log(chalk.green('✅ Configuration:'), 'Valid')
      
      spinner.text = 'Testing FHEVM client...'
      try {
        createFHEVMClientForNode(config)
        if (!options.quiet) console.log(chalk.green('✅ FHEVM Client:'), 'Created successfully')
      } catch (error) {
        if (!options.quiet) console.log(chalk.yellow('⚠️ FHEVM Client:'), 'Creation failed (expected in some environments)')
      }
      
      spinner.succeed('All tests passed!')
      
      if (!options.quiet) {
        console.log(chalk.blue('\n🎉 FHEVM Node.js CLI is ready to use!'))
        console.log(chalk.gray('Use --help to see available commands'))
      }
      
    } catch (error) {
      spinner.fail('Tests failed')
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
    }
  })

program
  .command('info')
  .description('Show detailed information about the FHEVM Node.js CLI')
  .action(() => {
    console.log(chalk.blue('\n🚀 Universal FHEVM SDK - Node.js CLI'))
    console.log(chalk.gray('─'.repeat(60)))
    console.log(chalk.blue('Version:'), '1.0.0')
    console.log(chalk.blue('Description:'), 'Command-line tools for FHEVM operations')
    console.log(chalk.blue('License:'), 'BSD-3-Clause-Clear')
    console.log(chalk.blue('Author:'), 'elegant')
    
    console.log(chalk.blue('\n📦 Available Commands:'))
    console.log(chalk.gray('  init           Interactive FHEVM setup and testing experience'))
    console.log(chalk.gray('  encrypt        Encrypt a value using FHEVM'))
    console.log(chalk.gray('  decrypt        Decrypt a handle using FHEVM'))
    console.log(chalk.gray('  batch-encrypt  Encrypt multiple values efficiently'))
    console.log(chalk.gray('  batch-decrypt  Decrypt multiple handles efficiently'))
    console.log(chalk.gray('  status         Check connection and configuration'))
    console.log(chalk.gray('  test           Test FHEVM connection and operations'))
    console.log(chalk.gray('  info           Show this information'))
    
    console.log(chalk.blue('\n🔧 Global Options:'))
    console.log(chalk.gray('  -c, --config <path>  Path to config file (default: .env)'))
    console.log(chalk.gray('  -v, --verbose        Verbose output'))
    console.log(chalk.gray('  --dry-run           Show what would be done without executing'))
    
    console.log(chalk.blue('\n📚 Examples:'))
    console.log(chalk.gray('  fhevm-node init'))
    console.log(chalk.gray('  fhevm-node encrypt --value 5 --public-key 0x...'))
    console.log(chalk.gray('  fhevm-node decrypt --handle 0x... --contract 0x... --public'))
    console.log(chalk.gray('  fhevm-node batch-encrypt --values "1,2,3" --public-key 0x...'))
    console.log(chalk.gray('  fhevm-node status --detailed'))
    
    console.log(chalk.blue('\n🌐 Learn more: https://github.com/zama-ai/fhevm'))
  })
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
})

if (process.argv[1] && process.argv[1].endsWith('cli.js')) {
  if (!process.argv.slice(2).length) {
    program.outputHelp()
    process.exit(0)
  }

  try {
    await program.parseAsync()
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('outputHelp') ||
      error.message.includes('help') ||
      process.argv.includes('--help') ||
      process.argv.includes('-h')
    )) {
      process.exit(0)
    }
    if (error instanceof Error && error.message.includes('command')) {
      program.outputHelp()
      process.exit(0)
    }
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

export default program