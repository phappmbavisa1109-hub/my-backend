// src/main.ts - NestJS + Cloudflare Workers with polyfills

// IMPORTANT: Define globals BEFORE any imports to ensure all modules see them
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define on globalThis IMMEDIATELY
Object.defineProperty(globalThis, '__filename', { 
  value: __filename, 
  configurable: true 
});
Object.defineProperty(globalThis, '__dirname', { 
  value: __dirname, 
  configurable: true 
});
Object.defineProperty(globalThis, '__dirname', { 
  value: __dirname, 
  configurable: true 
});

// Polyfill require() để NestJS không crash khi require optional packages
if (typeof (globalThis as any).require === 'undefined') {
  (globalThis as any).require = function(moduleId: string) {
    console.warn(`[Polyfill] require('${moduleId}') called but module not available`);
    return {};
  };
}

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
      logger: false,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const expressApp = app.getHttpServer();
    serverlessHandler = serverless(expressApp);

    await app.init();
  }

  return serverlessHandler;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
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