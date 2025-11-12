// src/handler.ts - Cloudflare Workers entry point
import { handler } from './main';

export default {
  async fetch(
    request: Request,
    env: Record<string, any>,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return handler(request as any, ctx) as unknown as Response;
  },
};
