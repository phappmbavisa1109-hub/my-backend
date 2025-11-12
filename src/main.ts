// src/main.ts - Express API for Cloudflare Workers
import express from 'express';
import serverless from 'serverless-http';
import { AppController } from './app.controller';

// Define environment types
export interface Env {
  DATABASE_URL: string;
}

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize app controller
const appController = new AppController();

// Routes
app.get('/', (req, res) => {
  res.json({ message: appController.getHello() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for Cloudflare Workers
const handler = serverless(app);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // Inject env into process
    (globalThis as any).process = {
      env: {
        ...process.env,
        ...env,
      },
    };

    return handler(request as any, ctx) as unknown as Response;
  },
};