import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
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
