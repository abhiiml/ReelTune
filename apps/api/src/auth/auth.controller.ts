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

    const userId = authData?.user?.id;

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        const existing = await this.prismaService.user.findUnique({ where: { email } });
        if (existing) {
          return { message: 'User already registered', user: existing };
        }
      } else {
        throw new HttpException(authError.message, HttpStatus.BAD_REQUEST);
      }
    }

    if (userId) {
      await this.prismaService.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email,
          displayName: name,
        },
        update: {
          displayName: name,
        },
      });
    }

    return {
      message: 'User registered successfully',
      user: authData?.user || { email },
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

    // Auto-sync profile on login if user ID is present
    if (data.user?.id) {
      const existing = await this.prismaService.user.findUnique({ where: { id: data.user.id } });
      if (!existing) {
        const userEmail = data.user.email || email;
        const displayName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          userEmail.split('@')[0];
        try {
          await this.prismaService.user.create({
            data: {
              id: data.user.id,
              email: userEmail,
              displayName,
            },
          });
        } catch {
          // Non-fatal
        }
      }
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } } }) {
    const supabaseUser = req.user;

    let user = await this.prismaService.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!user) {
      const email = supabaseUser.email || `${supabaseUser.id}@reeltune.user`;
      const displayName =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        email.split('@')[0] ||
        'ReelTune User';

      try {
        user = await this.prismaService.user.create({
          data: {
            id: supabaseUser.id,
            email,
            displayName,
          },
        });
      } catch {
        user = await this.prismaService.user.findUnique({ where: { id: supabaseUser.id } });
      }
    }

    if (!user) {
      throw new HttpException('User profile not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
