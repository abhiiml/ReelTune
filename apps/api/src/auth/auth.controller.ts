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
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.signUp({ email, password });

    if (authError) {
      throw new HttpException(authError.message, HttpStatus.BAD_REQUEST);
    }

    if (!authData.user) {
      throw new HttpException('Failed to create user in Supabase', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const userId = authData.user.id;

    // 2. Upsert user into PostgreSQL via Prisma
    await this.prismaService.user.upsert({
      where: { email },
      create: {
        id: userId,
        email,
        displayName: name,
      },
      update: {
        displayName: name,
      },
    });

    return {
      message: 'User registered successfully',
      user: authData.user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

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
    const supabaseUser = req.user;

    const user = await this.prismaService.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!user) {
      throw new HttpException('User profile not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
