// src/main.ts - NestJS + Cloudflare Workers

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import serverless from 'serverless-http';

export interface Env {
  DATABASE_URL: string;
}

let app: INestApplication;
let serverlessHandler: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: false, // Disable Nest logger to reduce noise
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Get Express app from NestJS
    const expressApp = app.getHttpServer();
    serverlessHandler = serverless(expressApp);

    await app.init();
  }

  return serverlessHandler;
}

// Cloudflare Workers entry point
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // Inject environment variables
    (global as any).process = {
      env: {
        ...process.env,
        ...env,
      },
    };

    const handler = await bootstrap();
    return handler(request as any, ctx) as unknown as Response;
  },
};