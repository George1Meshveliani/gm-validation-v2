import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: use repo name as base path when building
// Change 'bvr' to your repo name if different
const repoName = 'bvr'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${repoName}/` : '/',
}))
