import { Controller, Post, Get, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // 1. Create user in Supabase
    const { data: authData, error: authError } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new HttpException(authError.message, HttpStatus.BAD_REQUEST);
    }

    if (!authData.user) {
      throw new HttpException('Failed to create user in Supabase', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const userId = authData.user.id;

    // 2. Insert user into PostgreSQL via pg client (fallback for Prisma 8 RC)
    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      await client.query(
        `INSERT INTO "user" ("id", "email", "displayName", "updatedAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("email") DO NOTHING;`,
        [userId, email, name],
      );
    } finally {
      await client.end();
    }

    return {
      message: 'User registered successfully',
      user: authData.user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    // req.user is populated by SupabaseAuthGuard
    const supabaseUser = req.user;

    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const result = await client.query(
        `SELECT "id", "email", "displayName", "avatarUrl", "createdAt", "updatedAt" FROM "user" WHERE "id" = $1 LIMIT 1;`,
        [supabaseUser.id],
      );

      if (result.rows.length === 0) {
        throw new HttpException('User profile not found', HttpStatus.NOT_FOUND);
      }

      return result.rows[0];
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await client.end();
    }
  }
}
