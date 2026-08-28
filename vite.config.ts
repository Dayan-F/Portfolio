import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo from /Portfolio/, so the build needs that
  // prefix. The dev server stays at the root, where a prefix is only a nuisance.
  base: command === 'build' ? '/Portfolio/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
