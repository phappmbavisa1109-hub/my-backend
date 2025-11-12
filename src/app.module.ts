// src/app.module.ts (Đã sửa lỗi .js và __dirname)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { fileURLToPath } from 'url'; // <--- THÊM VÀO
import { dirname, join } from 'path'; // <--- THÊM VÀO

// --- SỬA TẤT CẢ CÁC IMPORT BÊN DƯỚI ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';
import { Token } from './entities/token.entity';
import { VideoHistory } from './entities/video-history.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { ProxyModule } from './proxy/proxy.module';
import { TokensModule } from './tokens/tokens.module';
import { VideoHistoryModule } from './video-history/video-history.module';

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