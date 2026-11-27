import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["firebase-admin", "firebase-functions"], // ブラウザに含めない
  },
  build: {
    rollupOptions: {
      external: ["firebase-admin", "firebase-functions"], // バンドルから除外
    },
  },
})
