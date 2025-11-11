import { MigrationInterface, QueryRunner } from 'typeorm';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export class CreateUploadsDirectory1710473600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const uploadsPath = join(process.cwd(), 'uploads');
    const videosPath = join(uploadsPath, 'videos');
    
    try {
      await mkdir(uploadsPath, { recursive: true });
      await mkdir(videosPath, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directories:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // We don't remove the directories in down migration for safety
  }
}