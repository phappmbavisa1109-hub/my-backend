import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entities/video.entity';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async create(videoData: Partial<Video>, userId: string): Promise<Video> {
    const video = this.videoRepository.create({
      ...videoData,
      user: { id: userId },
    });
    return await this.videoRepository.save(video);
  }

  async findAll(userId: string): Promise<Video[]> {
    return await this.videoRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: string): Promise<Video | null> {
    return await this.videoRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async getVideoFile(filePath: string): Promise<StreamableFile> {
    const file = createReadStream(join(process.cwd(), filePath));
    return new StreamableFile(file);
  }

  async update(id: number, userId: string, updateData: Partial<Video>): Promise<Video | null> {
    await this.videoRepository.update(
      { id, user: { id: userId } },
      updateData,
    );
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.videoRepository.delete({ id, user: { id: userId } });
  }
}