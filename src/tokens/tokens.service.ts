import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity.js';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async create(tokenData: Partial<Token>): Promise<Token> {
    try {
      console.log('Creating token with data:', tokenData);
      
      // Validate required fields
      if (!tokenData.projectId || !tokenData.accessToken) {
        console.log('Missing required fields');
        throw new Error('Project ID và Access Token là bắt buộc');
      }

      // Check for existing token using raw query to ensure exact match
      const existingToken = await this.tokenRepository.query(
        `SELECT id FROM tokens WHERE project_id = $1 OR access_token = $2 LIMIT 1`,
        [tokenData.projectId, tokenData.accessToken]
      );

      if (existingToken.length > 0) {
        throw new Error('Token với Project ID hoặc Access Token này đã tồn tại');
      }

      // Insert new token using raw query
      const result = await this.tokenRepository.query(
        `INSERT INTO tokens (
          project_id, 
          access_token, 
          credits, 
          status, 
          last_used,
          metadata,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING *`,
        [
          tokenData.projectId,
          tokenData.accessToken,
          0, // initial credits
          'active', // initial status
          new Date(), // last_used
          JSON.stringify(tokenData.metadata || {}) // metadata as JSONB
        ]
      );

      const savedToken = result[0];
      console.log('Token created successfully:', savedToken.id);
      return savedToken;
    } catch (error) {
      console.error('Token creation error:', error);
      throw error;
    }
  }

  async findAll(): Promise<Token[]> {
    try {
      // Use raw query to get all tokens with proper column names
      const tokens = await this.tokenRepository.query(`
        SELECT 
          id,
          project_id as "projectId",
          access_token as "accessToken",
          credits,
          status,
          last_used as "lastUsed",
          metadata,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM tokens 
        ORDER BY created_at DESC
      `);
      
      console.log(`Retrieved ${tokens.length} tokens`);
      return tokens;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      throw new Error('Không thể lấy danh sách token');
    }
  }

  async findOne(id: number): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { id },
    });
    if (!token) {
      throw new Error(`Token không tồn tại`);
    }
    return token;
  }

  async update(id: number, tokenData: Partial<Token>): Promise<Token> {
    const token = await this.findOne(id);
    Object.assign(token, tokenData);
    return this.tokenRepository.save(token);
  }

  async findByStatus(status: string): Promise<Token[]> {
    return await this.tokenRepository.find({
      where: { status },
      order: { lastUsed: 'ASC' }
    });
  }

  async updateStatus(id: number, status: string): Promise<Token> {
    const token = await this.findOne(id);
    token.status = status;
    token.lastUsed = new Date();
    return await this.tokenRepository.save(token);
  }

  async updateCredits(id: number, creditsUsed: number): Promise<Token> {
    const token = await this.findOne(id);
    token.credits -= creditsUsed;
    token.lastUsed = new Date();
    return await this.tokenRepository.save(token);
  }

  async getNextAvailableToken(): Promise<Token | null> {
    const activeTokens = await this.tokenRepository.find({
      where: { status: 'active' },
      order: { lastUsed: 'ASC', credits: 'DESC' }
    });

    return activeTokens.length > 0 ? activeTokens[0] : null;
  }

  async delete(id: number): Promise<void> {
    const token = await this.findOne(id);
    await this.tokenRepository.delete(id);
  }
}