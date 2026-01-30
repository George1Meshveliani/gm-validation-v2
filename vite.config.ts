import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: base path is set by CI (VITE_BASE_PATH) or defaults to repo name
const basePath = process.env.VITE_BASE_PATH || 'gm-validation-v2'
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${basePath}/` : '/',
}))
