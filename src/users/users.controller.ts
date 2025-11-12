import { Controller, Get, Body, Param, Put, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from '../entities/user.entity.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Put(':id/role')
  @UseGuards(AdminGuard)
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string
  ): Promise<User> {
    if (!['admin', 'user'].includes(role)) {
      throw new UnauthorizedException('Invalid role');
    }
    return this.usersService.updateRole(id, role);
  }
}