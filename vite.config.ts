import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/frontend')
    }
  },
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
  },
})
