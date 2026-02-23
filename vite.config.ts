import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [r('..'), r('.')],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'zustand', 'lucide-react'],
    alias: [
      // @shared → filmmaker-pro source
      { find: '@shared', replacement: r('../filmmaker-pro/src') },
      // Force ALL zustand imports (from any directory) to one copy
      { find: /^zustand\/middleware$/, replacement: r('node_modules/zustand/middleware') },
      { find: /^zustand\/vanilla$/, replacement: r('node_modules/zustand/vanilla') },
      { find: /^zustand$/, replacement: r('node_modules/zustand') },
      // Force single React
      { find: /^react-dom$/, replacement: r('node_modules/react-dom') },
      { find: /^react$/, replacement: r('node_modules/react') },
    ],
  },
  optimizeDeps: {
    include: ['zustand', 'zustand/middleware', 'react', 'react-dom'],
  },
});
