import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssConfig from './postcss.config.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: postcssConfig,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

