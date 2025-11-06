#!/usr/bin/env node

/**
 * Vue build script that optionally skips type checking
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const envVar = process.env.VITE_IGNORE_BUILD_ERROR;
const ignoreBuildError = envVar === 'true' || envVar === '1' || envVar === 'TRUE';

if (ignoreBuildError) {
  console.log('Building Vue app (this may take a minute)...');
  const startTime = Date.now();
  execSync('vite build', { stdio: 'inherit' });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Build completed in ${duration}s`);
} else {
  console.log('Running type check...');
  try {
    execSync('vue-tsc', { stdio: 'inherit' });
    console.log('Type check passed');
    console.log('Building Vue app...');
    execSync('vite build', { stdio: 'inherit' });
    console.log('Build completed');
  } catch (error) {
    console.error('Type check failed');
    process.exit(1);
  }
}

