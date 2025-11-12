import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoHistory } from '../entities/video-history.entity.js';
import { VideoHistoryService } from './video-history.service.js';
import { VideoHistoryController } from './video-history.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([VideoHistory])],
    controllers: [VideoHistoryController],
    providers: [VideoHistoryService],
    exports: [VideoHistoryService],
})
export class VideoHistoryModule {}