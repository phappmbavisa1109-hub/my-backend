import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '60d' });
    
    // Update user with refresh token
    await this.userRepository.update(user.id, { refreshToken });
    
    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        isAdmin: user.role === 'admin'
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      // Validate input
      if (!createUserDto.email || !createUserDto.password) {
        throw new BadRequestException('Email và mật khẩu là bắt buộc');
      }

      if (!createUserDto.firstName || !createUserDto.lastName) {
        throw new BadRequestException('Họ và tên là bắt buộc');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createUserDto.email)) {
        throw new BadRequestException('Email không hợp lệ');
      }

      // Check existing user
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email đã tồn tại trong hệ thống');
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = this.userRepository.create({
        email: createUserDto.email.trim(),
        password: hashedPassword,
        firstName: createUserDto.firstName.trim(),
        lastName: createUserDto.lastName.trim(),
        isActive: true
      });

      // Save user
      const savedUser = await this.userRepository.save(user);
      console.log('User registered successfully:', { id: savedUser.id, email: savedUser.email });
      
      // Return user without password
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === '23505') { // PostgreSQL unique violation error
        throw new BadRequestException('Email đã tồn tại trong hệ thống');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Có lỗi xảy ra khi đăng ký');
    }
  }
}