import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
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