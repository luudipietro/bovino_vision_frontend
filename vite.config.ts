import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Quick Cloudflare tunnels (`cloudflared tunnel --url http://localhost:5173`) get a random subdomain.
    allowedHosts: ['.trycloudflare.com'],
    // With VITE_API_URL=/api the API is served from the same origin as the page, so the
    // SameSite=Strict session cookie also works through a tunnel.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
