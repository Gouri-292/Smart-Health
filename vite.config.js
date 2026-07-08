import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Helper to recursively find all .html files and generate an input map for Vite
function getHtmlEntries(dir, entries = {}) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'dist') {
      getHtmlEntries(filePath, entries);
    } else if (file.endsWith('.html')) {
      // Create a clean key for rollup output mapping
      let name = path.relative(__dirname, filePath).replace(/\\/g, '/').replace('.html', '');
      if (name === 'index') name = 'main'; // special case for root index
      entries[name] = resolve(__dirname, filePath);
    }
  }
  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlEntries(__dirname)
    }
  },
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