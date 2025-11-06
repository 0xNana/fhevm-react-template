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
  logLevel: 'warn',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
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
