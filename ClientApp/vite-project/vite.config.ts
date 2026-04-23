import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost.pem")),
    },
    // Proxy API calls to Optimizely backend
    proxy: {
      '/dashboard-api': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false, // Allow self-signed certs in dev
        rejectUnauthorized: false,
      },
      '/api': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false,
        rejectUnauthorized: false,
      },
      '/hubs': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false,
        rejectUnauthorized: false,
        ws: true, // Enable WebSocket for SignalR
      },
    },
  },

  html: {
    cspNonce: '__CSP_NONCE__'
  },


  /*
    // PROD-build (när npm run build körs) - allt byggs i wwwroot/client
    base: "/client/",
    build: {
      outDir: path.resolve(__dirname, "../../wwwroot/client"),
      emptyOutDir: true,
      sourcemap: true,
      manifest: true,
    },
  */
});




