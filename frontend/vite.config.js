import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
   server: {
    host: '0.0.0.0',  
    port: 5173,
    strictPort: true, // ถ้ามี process ใช้ port นี้อยู่ จะ error แทนสุ่มพอร์ตใหม่
    watch: {
      usePolling: true  // แนะนำสำหรับ Docker + WSL + macOS
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