// Đây là file wrangler.config.ts (phiên bản ESM)
import { defineConfig } from 'wrangler';

export default defineConfig({
  // 1. Tên worker
  name: 'veolagi',

  // 2. File chính (file main.ts đã sửa)
  main: 'src/main.ts',

  // 3. Ngày tương thích
  compatibility_date: '2025-11-01',

  // 4. Cờ tương thích Node.js
  compatibility_flags: [ 'nodejs_compat' ],

  // 5. PHẦN SỬA LỖI NESTJS (4 lỗi ERROR)
  esbuild: {
    external: [
      '@nestjs/websockets/socket-module',
      '@nestjs/microservices/microservices-module',
      '@nestjs/microservices',
    ],
  },
});