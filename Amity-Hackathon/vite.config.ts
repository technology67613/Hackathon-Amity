import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@lib': fileURLToPath(new URL('../src/lib', import.meta.url)) } },
  server: { fs: { allow: ['..'] } },
  optimizeDeps: { include: ['@supabase/supabase-js'] },
})
