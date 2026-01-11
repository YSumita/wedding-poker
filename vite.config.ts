import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost', // localhostで明示的にリッスン
    strictPort: false, // ポートが使用中の場合は別のポートを使用
    open: '/', // ブラウザを自動で開く
    cors: true, // CORSを有効化
  },
})
