// src/app.module.ts (Đã sửa lỗi .js và __dirname)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { fileURLToPath } from 'url'; // <--- THÊM VÀO
import { dirname, join } from 'path'; // <--- THÊM VÀO

// --- SỬA TẤT CẢ CÁC IMPORT BÊN DƯỚI ---
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import configuration from './config/configuration.js';
import { User } from './entities/user.entity.js';
import { Video } from './entities/video.entity.js';
import { Token } from './entities/token.entity.js';
import { VideoHistory } from './entities/video-history.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { VideosModule } from './videos/videos.module.js';
import { ProxyModule } from './proxy/proxy.module.js';
import { TokensModule } from './tokens/tokens.module.js';
import { VideoHistoryModule } from './video-history/video-history.module.js';

// --- SỬA LỖI __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [User, Video, Token, VideoHistory],
        // SỬ DỤNG BIẾN __dirname MỚI
        migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
        autoLoadEntities: true,
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    ProxyModule,
    TokensModule,
    VideoHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}