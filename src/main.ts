// src/main.ts (Phiên bản ES Module chuẩn cho Cloudflare)

// Polyfill require() for Cloudflare Workers ESM environment
// NestJS tries to dynamically require optional packages; we intercept with a no-op
if (typeof (globalThis as any).require === 'undefined') {
  (globalThis as any).require = function(id: string) {
    console.warn(`[Polyfill] require('${id}') called but not available in Cloudflare Workers`);
    return {};
  };
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import serverless from 'serverless-http';

// Định nghĩa kiểu cho Env (sẽ được truyền từ Cloudflare)
export interface Env {
  DATABASE_URL: string;
  // FRONTEND_URL: string;
}

// Biến toàn cục để 'cache' app (tăng hiệu suất)
let app: INestApplication;
let serverlessHandler: serverless.Handler;

// Hàm khởi tạo app (chỉ chạy 1 lần)
async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'], // Tắt bớt log
    });

    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://192.168.1.9:5173',
        'http://localhost:3000',
        // THÊM URL CỦA FE VÀO ĐÂY, ví dụ: process.env.FRONTEND_URL
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const server = app.getHttpServer();
    serverlessHandler = serverless(server);
  }
  return serverlessHandler;
}

// Đây là cú pháp ESM chuẩn mà Cloudflare Workers mong đợi
export default {
  async fetch(
    request: Request, // Request của Cloudflare
    env: Env,         // Secret/vars
    ctx: ExecutionContext,
  ): Promise<Response> {
    
    // Inject các biến Env của Cloudflare vào process.env
    global.process.env = { ...global.process.env, ...env };

    // Lấy (hoặc tạo) app handler
    const handler = await bootstrap();

    // Chuyển request cho 'serverless-http' xử lý
    return handler(request as any, ctx) as unknown as Response;
  },
};