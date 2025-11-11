import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideosService } from './videos.service';
import { Video } from '../entities/video.entity';
import { storageConfig } from '../config/storage.config';
import { UploadVideoDto } from './dto/upload-video.dto';
import type { Express } from 'express';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video', storageConfig))
  async uploadVideo(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    try {
      const videoData = {
        ...uploadDto,
        generatedVideos: {
          [uploadDto.sceneId]: file.path
        }
      };
      return await this.videosService.create(videoData, req.user.id);
    } catch (error) {
      throw new Error('Không thể lưu video. ' + error.message);
    }
  }

  @Get()
  async findAll(@Request() req) {
    return await this.videosService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: number) {
    return await this.videosService.findOne(id, req.user.id);
  }

  @Get(':id/stream')
  async streamVideo(
    @Request() req,
    @Param('id') id: number,
  ) {
    const video = await this.videosService.findOne(id, req.user.id);
    if (!video || !video.generatedVideos) {
      throw new Error('Video not found');
    }

    // We'll take the first video in the generatedVideos object
    const videoPath = Object.values(video.generatedVideos)[0];
    return this.videosService.getVideoFile(videoPath);
  }

  @Get(':id/download')
  async downloadVideo(
    @Request() req,
    @Param('id') id: number,
  ) {
    const video = await this.videosService.findOne(id, req.user.id);
    if (!video || !video.generatedVideos) {
      throw new Error('Video not found');
    }

    // We'll take the first video in the generatedVideos object
    const videoPath = Object.values(video.generatedVideos)[0];
    return this.videosService.getVideoFile(videoPath);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<Video>,
  ) {
    return await this.videosService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: number) {
    return await this.videosService.delete(id, req.user.id);
  }
}