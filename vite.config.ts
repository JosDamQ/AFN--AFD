import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  /**
   * En producción Electron carga el index.html como archivo local (file://),
   * así que las rutas de assets deben ser relativas, no absolutas.
   */
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
