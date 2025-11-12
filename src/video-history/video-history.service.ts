import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoHistory, VideoType } from '../entities/video-history.entity.js';

@Injectable()
export class VideoHistoryService {
    constructor(
        @InjectRepository(VideoHistory)
        private videoHistoryRepository: Repository<VideoHistory>,
    ) {}

    async create(data: {
        userId: string;
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
    }): Promise<VideoHistory> {
        const videoHistory = this.videoHistoryRepository.create(data);
        return await this.videoHistoryRepository.save(videoHistory);
    }

    async findByUserId(userId: string, videoType?: VideoType): Promise<VideoHistory[]> {
        console.log('Finding videos for user:', userId, 'type:', videoType);
        
        try {
            // Sử dụng raw query để đảm bảo chính xác tên cột
            let sql = `
                SELECT 
                    id,
                    prompt,
                    video_url as "videoUrl",
                    video_type as "videoType",
                    settings,
                    created_at as "createdAt",
                    updated_at as "updatedAt"
                FROM video_history 
                WHERE user_id = $1
            `;
            
            const params: any[] = [userId];
            
            if (videoType) {
                sql += ` AND video_type = $2`;
                params.push(videoType);
            }
            
            sql += ` ORDER BY created_at DESC`;
            
            console.log('Executing SQL:', sql, 'with params:', params);
            const results = await this.videoHistoryRepository.query(sql, params);
            console.log('Query results:', results);
            
            return results;
        } catch (error) {
            console.error('Error finding videos:', error);
            throw new Error('Không thể tải lịch sử video');
        }
    }

    async findOne(id: string): Promise<VideoHistory> {
        const videoHistory = await this.videoHistoryRepository.findOne({
            where: { id }
        });
        if (!videoHistory) {
            throw new Error('Video history not found');
        }
        return videoHistory;
    }

    async delete(id: string): Promise<void> {
        await this.videoHistoryRepository.delete(id);
    }
}