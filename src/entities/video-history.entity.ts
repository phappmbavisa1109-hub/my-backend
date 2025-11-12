import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';

export enum VideoType {
    BATCH = 'batch',    // Video tạo hàng loạt
    SCRIPT = 'script'   // Video tạo theo kịch bản
}

@Entity('video_history')
export class VideoHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    prompt: string;

    @Column({ name: 'video_url' })
    videoUrl: string;

    @Column({ name: 'video_type' })
    videoType: VideoType;

    @Column({ type: 'jsonb', default: {} })
    settings: {
        aspectRatio: string;
        resolution: string;
        duration: string;
        zoom: string;
        mute: boolean;
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}