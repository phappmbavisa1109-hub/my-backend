import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('json')
  script: object;

  @Column('json')
  scenes: object[];

  @Column()
  aspectRatio: string;

  @Column()
  totalDurationSec: number;

  @Column('json')
  generatedVideos: {
    [key: number]: string; // Maps scene ID to video file path
  };

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => User, user => user.videos)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}