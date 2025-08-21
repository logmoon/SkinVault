import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/steam-api": {
        target: "https://steamcommunity.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, ""),
    }
  }
}
})
