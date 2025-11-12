import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../entities/video.entity.js'; // <--- ĐÃ SỬA
import { VideosController } from '../videos/videos.controller.js';
import { VideosService } from '../videos/videos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}