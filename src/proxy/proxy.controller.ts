import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { Response } from 'express';
import { ProxyService } from './proxy.service.js';

@Controller('proxy')
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('video/:videoUrl')
  async proxyVideo(@Param('videoUrl') videoUrl: string, @Res() res: Response) {
    try {
      const decodedUrl = decodeURIComponent(videoUrl);
      const response = await this.proxyService.streamVideo(decodedUrl);

      // Set appropriate headers
      res.setHeader('Content-Type', response.headers['content-type']);
      res.setHeader('Content-Disposition', 'inline');

      // Pipe the video stream to response
      response.data.pipe(res);
    } catch (error) {
      res.status(500).json({ message: 'Error streaming video' });
    }
  }
}