import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokensService } from './tokens.service';
import { Token } from '../entities/token.entity';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  async create(@Body() tokenData: Partial<Token>) {
    return this.tokensService.create(tokenData);
  }

  @Get()
  async findAll() {
    return this.tokensService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.tokensService.findByStatus('active');
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.tokensService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateData: Partial<Token>) {
    return this.tokensService.update(id, updateData);
  }

  @Put(':id/credits')
  async updateCredits(@Param('id') id: number, @Body('credits') credits: number) {
    return this.tokensService.updateCredits(id, credits);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.tokensService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.tokensService.delete(id);
  }

  @Get('next/available')
  async getNextAvailableToken() {
    return this.tokensService.getNextAvailableToken();
  }
}