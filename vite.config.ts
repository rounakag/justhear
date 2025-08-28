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
  // Build optimization for faster deployment
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for production to reduce bundle size
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-accordion',
            '@radix-ui/react-collapsible'
          ],
          // Form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Router
          'router-vendor': ['react-router-dom'],
          // Utilities
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        // Optimize file naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Reduce bundle size
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: false,
  },
  // Development server
  server: {
    port: 3000,
    open: true,
  },
  // Preview server
  preview: {
    port: 4173,
    allowedHosts: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-accordion',
      '@radix-ui/react-collapsible',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'lucide-react',
    ],
  },
})
