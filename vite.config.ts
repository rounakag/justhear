import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // Enable JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  // Build optimization
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-accordion', '@radix-ui/react-sheet'],
        },
      },
    },
  },
  // Development server
  server: {
    port: 3000,
    open: true,
  },
  // Preview server
  preview: {
    port: 4173,
  },
})
