import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const suppressNoisyWarnings = () => {
  return {
    name: 'suppress-noisy-warnings',
    buildStart() {
      const originalWarn = console.warn
      const originalLog = console.log
      
      console.warn = (...args: any[]) => {
        const message = String(args[0] || '')
        
        if (message.includes('Module level directives cause errors when bundled') &&
            message.includes('"use client"')) {
          return
        }
        
        if (message.includes('Error when using sourcemap for reporting an error') &&
            message.includes("Can't resolve original location of error")) {
          return
        }
        
        if (message.includes('/*#__PURE__*/') &&
            message.includes('contains an annotation that Rollup cannot interpret')) {
          return
        }
        
        originalWarn.apply(console, args)
      }
      
      console.log = (...args: any[]) => {
        const message = String(args[0] || '')
        
        if (message.includes('transforming (')) {
          return
        }
        
        if (message.includes('vite v') && message.includes('building for production')) {
          return
        }
        
        originalLog.apply(console, args)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue() as any, suppressNoisyWarnings()],
  logLevel: 'info',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    preserveSymlinks: false,
    dedupe: ['vue', '@vue/runtime-dom', '@tanstack/query-core'],
  },
  server: {
    port: 3001,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia', 
      '@vue/runtime-dom', 
      '@tanstack/query-core', 
      '@tanstack/vue-query',
      '@fhevm/sdk',
      '@fhevm/sdk/vue'
    ],
    exclude: ['@zama-fhe/relayer-sdk'],
    esbuildOptions: {
      preserveSymlinks: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia', '@vue/runtime-dom'],
          'vendor-query': ['@tanstack/vue-query', '@tanstack/query-core'],
          'vendor-web3': ['wagmi', 'viem', '@reown/appkit'],
        }
      },
      onwarn(warning, warn) {
        if (warning.message?.includes('Module level directives cause errors when bundled') &&
            warning.message?.includes('"use client"')) {
          return
        }
        
        if (warning.message?.includes('Error when using sourcemap for reporting an error') &&
            warning.message?.includes("Can't resolve original location of error")) {
          return
        }
        
        if (warning.message?.includes('/*#__PURE__*/') &&
            warning.message?.includes('contains an annotation that Rollup cannot interpret')) {
          return
        }
        
        warn(warning)
      }
    }
  }
})
