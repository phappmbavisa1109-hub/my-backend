import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VideoHistoryService } from './video-history.service.js';
import { VideoType } from '../entities/video-history.entity.js';
import { User as UserEntity } from '../entities/user.entity.js';
import { User } from '../decorators/user.decorator.js';

@Controller('video-history')
@UseGuards(JwtAuthGuard)
export class VideoHistoryController {
    constructor(private readonly videoHistoryService: VideoHistoryService) {}

    @Post()
    async create(
        @User() user: UserEntity,
        @Body() createVideoHistoryDto: {
            prompt: string;
            videoUrl: string;
            videoType: VideoType;
            settings: {
                aspectRatio: string;
                resolution: string;
                duration: string;
                zoom: string;
                mute: boolean;
            };
        }
    ) {
        return this.videoHistoryService.create({
            userId: user.id,
            ...createVideoHistoryDto,
        });
    }

    @Get()
    async findAll(
        @User() user: UserEntity,
        @Query('type') videoType?: VideoType
    ) {
        console.log('Getting video history for user:', user.id, 'type:', videoType);
        const result = await this.videoHistoryService.findByUserId(user.id, videoType);
        console.log('Found videos:', result.length);
        return result;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.videoHistoryService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.videoHistoryService.delete(id);
    }
}