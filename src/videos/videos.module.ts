import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../entities/video.entity'; // <--- ĐÃ SỬA
import { VideosController } from '../videos/videos.controller';
import { VideosService } from '../videos/videos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}