import { DataSource } from 'typeorm';
import { Token } from './src/entities/token.entity';
import { User } from './src/entities/user.entity';
import { Video } from './src/entities/video.entity';
import { CreateTokensTable1710474100000 } from './src/migrations/1710474100000-CreateTokensTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456ab-',
  database: 'veo3',
  entities: [Token, User, Video],
  migrations: [CreateTokensTable1710474100000],
  synchronize: false,
});