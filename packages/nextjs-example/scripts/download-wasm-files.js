#!/usr/bin/env node

/**
 * Script to copy WASM files from node_modules to the public folder
 * This allows local hosting of WASM files to bypass CORS issues
 * 
 * The WASM files are already in node_modules/@zama-fhe/relayer-sdk/bundle/
 * so we just need to copy them to the public folder.
 * 
 * Usage: pnpm run copy-wasm
 */

const fs = require('fs');
const path = require('path');

const NODE_MODULES_DIR = path.join(__dirname, '..', 'node_modules', '@zama-fhe', 'relayer-sdk', 'bundle');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const files = [
  'tfhe_bg.wasm',
  'kms_lib_bg.wasm',
];

function copyFile(source, dest) {
  return new Promise((resolve, reject) => {
    const sourcePath = path.join(NODE_MODULES_DIR, source);
    const destPath = path.join(PUBLIC_DIR, source);
    
    if (!fs.existsSync(sourcePath)) {
      reject(new Error(`Source file not found: ${sourcePath}`));
      return;
    }
    
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Copied: ${source}`);
        resolve();
      }
    });
  });
}

async function main() {
  // Check if node_modules directory exists
  if (!fs.existsSync(NODE_MODULES_DIR)) {
    console.error(`❌ Error: node_modules not found at ${NODE_MODULES_DIR}`);
    console.error('💡 Please run "pnpm install" first.');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  console.log('🚀 Copying WASM files from node_modules...\n');
  console.log(`📦 Source: ${NODE_MODULES_DIR}`);
  console.log(`📁 Destination: ${PUBLIC_DIR}\n`);

  for (const file of files) {
    try {
      await copyFile(file, file);
    } catch (error) {
      console.error(`❌ Failed to copy ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All WASM files copied successfully!');
  console.log(`📁 Files are in: ${PUBLIC_DIR}`);
  console.log('\n💡 The SDK will automatically fallback to these local files if CDN fails.');
}

main().catch(console.error);

