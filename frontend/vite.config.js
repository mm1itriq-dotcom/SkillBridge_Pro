import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:5000',
      '/student': 'http://127.0.0.1:5000',
      '/instructor': 'http://127.0.0.1:5000',
      '/courses': 'http://127.0.0.1:5000'
    }
  }
})