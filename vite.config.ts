import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // the only big chunk is three.js for the hero's live 3D cup (cup3d, ~160 kB gzip) — lazy, loaded inside the hero
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // keep the animation engine in its own long-cached chunk
        manualChunks(id) {
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap') || id.includes('node_modules/lenis')) return 'motion-gsap'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
