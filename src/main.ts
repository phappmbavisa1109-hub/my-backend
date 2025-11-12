// src/main.ts (Phiên bản CJS cho Webpack)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import serverless from 'serverless-http';
import { Request as ExpressRequest } from 'express'; // Đổi tên để tránh xung đột

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

// Đây là phần quan trọng: Export handler theo kiểu CommonJS
// Wrangler (với format = "commonjs") sẽ tự động bọc
// module.exports này trong một 'fetch' handler.
module.exports.handler = async (
  request: Request, // Đây là Request của Cloudflare
  env: Env,         // Đây là các secret/vars
  ctx: ExecutionContext,
): Promise<Response> {
  // RẤT QUAN TRỌNG: Inject các biến Env của Cloudflare vào process.env
  // Để NestJS ConfigService hoặc TypeORM có thể đọc được
  // Logic này từ file cũ của bạn  là rất chính xác!
  global.process.env = { ...global.process.env, ...env };

  // Lấy (hoặc tạo) app handler
  const handler = await bootstrap();

  // Chuyển request cho 'serverless-http' xử lý
  // Cần ép kiểu 'Request' của Cloudflare thành 'ExpressRequest' (hoặc 'any')
  return handler(request as any, ctx) as unknown as Response;
};