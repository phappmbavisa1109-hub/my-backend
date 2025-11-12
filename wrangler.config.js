/**
 * Wrangler configuration for NestJS + Cloudflare Workers
 * This config uses esbuild externals to exclude optional NestJS packages from bundling
 */

export default {
  name: 'veolagi',
  main: 'dist/main.js',
  compatibility_date: '2025-11-01',
  compatibility_flags: ['nodejs_compat'],

  // Cấu hình build cho esbuild
  build: {
    // Các module/package không nên được bundle vào output
    // esbuild sẽ để chúng dưới dạng external require() trong code
    external: [
      '@nestjs/websockets',
      '@nestjs/websockets/socket-module',
      '@nestjs/microservices',
      '@nestjs/microservices/microservices-module',
    ],
  },
};
