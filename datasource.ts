import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/entities/user.entity';
import { Video } from './src/entities/video.entity';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'veo3',
  entities: [User, Video],
  migrations: [__dirname + '/src/migrations/*.ts'],
  synchronize: false,
});