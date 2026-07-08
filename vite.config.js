import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true, // or ["tucson-cost-your-cleanup.trycloudflare.com"]

    proxy: {
      '/api': {
        target: 'https://smart-health-sbqq.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});