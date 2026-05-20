import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
  },
   server: {
    host: '0.0.0.0',  
    port: 5173,
    strictPort: true, // ถ้ามี process ใช้ port นี้อยู่ จะ error แทนสุ่มพอร์ตใหม่
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['lodash', 'date-fns', 'framer-motion'],
        }
      }
    }
  },
  plugins: [
    react(), 
    visualizer({
      open: true
    })
    
  ],
})