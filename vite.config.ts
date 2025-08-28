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
      },
      "/items": {
        target: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/items/, ""),
      },
      "/name-id": {
        target: "https://raw.githubusercontent.com/somespecialone/steam-item-name-ids/refs/heads/master/data/cs2.json",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/name-id/, ""),
      }
    }
  }
})
