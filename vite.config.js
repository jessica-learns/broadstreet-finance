import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sec-files': {
        target: 'https://www.sec.gov',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/sec-files/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('User-Agent', 'BroadstreetFinance Jessica_Croll@kenan-flagler.unc.edu');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate');
          });
        }
      },
      '/api/sec': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/sec/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('User-Agent', 'BroadstreetFinance Jessica_Croll@kenan-flagler.unc.edu');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate');
          });
        }
      }
    }
  }
})
