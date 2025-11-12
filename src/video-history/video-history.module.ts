import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoHistory } from '../entities/video-history.entity';
import { VideoHistoryService } from './video-history.service';
import { VideoHistoryController } from './video-history.controller';

@Module({
    imports: [TypeOrmModule.forFeature([VideoHistory])],
    controllers: [VideoHistoryController],
    providers: [VideoHistoryService],
    exports: [VideoHistoryService],
})
export class VideoHistoryModule {}