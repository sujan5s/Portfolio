import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js and its ecosystem into a separate chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Split animation libraries
          'animation-vendor': ['gsap', 'motion'],
          // Split React core
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // Increase the chunk size warning limit slightly since 3D libraries are inherently large
    chunkSizeWarningLimit: 1000
  }
})
