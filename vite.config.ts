import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // Use relative paths for Electron
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2015', // Better mobile compatibility
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 500, // Smaller chunks for better loading
      minify: 'esbuild',
      sourcemap: false, // Disable sourcemaps for production
      reportCompressedSize: false, // Speed up build
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    },
  };
});
