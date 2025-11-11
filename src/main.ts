// src/main.ts (Phiên bản đã cập nhật cho Cloudflare)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common'; // <-- Đã import
import { ConfigService } from '@nestjs/config'; // <-- Đã import
import serverless from 'serverless-http'; // <-- Adapter (Đã sửa)

// Biến toàn cục để 'cache' app (tăng hiệu suất)
let app: INestApplication;
let serverlessHandler: serverless.Handler;

// Interface này khai báo các 'secret' của Cloudflare
export interface Env {
  DATABASE_URL: string;
  // Sau này, bạn nên thêm URL của frontend vào đây, ví dụ:
  // FRONTEND_URL: string;
}

// Hàm khởi tạo app (chỉ chạy 1 lần)
async function getApp(env: Env) {
  if (!app) {
    // RẤT QUAN TRỌNG: Đưa secret (DATABASE_URL) vào 'process.env'
    // để ConfigService hoặc Prisma/TypeORM có thể đọc được
    global.process.env = { ...global.process.env, ...env };

    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'], // Tắt bớt log cho môi trường serverless
    });

    // --- BẮT ĐẦU LOGIC CỦA BẠN (TỪ FILE CŨ) ---

    // 1. Cấu hình CORS
    // CẢNH BÁO: Bạn sẽ cần thêm URL của Frontend (Cloudflare Pages) vào đây
    // sau khi bạn deploy nó ở Bước 4.
    app.enableCors({
      origin: [
        'http://localhost:5173', 
        'http://192.168.1.9:5173', 
        'http://localhost:3000',
        // THÊM URL CỦA FE VÀO ĐÂY, ví dụ: 'https://my-frontend.pages.dev'
        // Bạn có thể lấy nó từ env.FRONTEND_URL
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization',
    });

    // 2. Thêm GlobalPipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // --- KẾT THÚC LOGIC CỦA BẠN ---

    // BẮT BUỘC: Nest 10+ cần .init()
    await app.init();
    
    // Tạo 'handler' từ app Nest
    const server = app.getHttpServer();
    serverlessHandler = serverless(server);
  }
  return serverlessHandler;
}

// Đây là 'export default' mà Cloudflare Workers cần
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    
    // Lấy (hoặc tạo) app handler
    const handler = await getApp(env);

    // Chuyển request cho 'serverless-http' xử lý
    return handler(request as any, ctx) as unknown as Response;
  },
};