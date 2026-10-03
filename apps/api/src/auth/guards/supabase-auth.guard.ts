import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header.');
    }

    const token = authHeader.split(' ')[1];

    // Supabase will verify the JWT signature automatically
    const { data, error } = await this.supabaseService.getClient().auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    // Attach user to request
    request.user = data.user;

    // Ensure user row exists in PostgreSQL so foreign key relations (playlists, saved songs) never fail
    try {
      const email = data.user.email || `${data.user.id}@reeltune.user`;
      const displayName =
        (data.user.user_metadata?.full_name as string | undefined) ||
        (data.user.user_metadata?.name as string | undefined) ||
        email.split('@')[0] ||
        'ReelTune User';

      const existingUser = await this.prismaService.user.findUnique({
        where: { id: data.user.id },
      });

      if (!existingUser) {
        // Check if an entry with this email already exists under another ID (e.g. from seeds)
        const userWithEmail = await this.prismaService.user.findUnique({
          where: { email },
        });

        if (!userWithEmail) {
          await this.prismaService.user.create({
            data: {
              id: data.user.id,
              email,
              displayName,
            },
          });
        }
      }
    } catch (syncErr) {
      this.logger.warn(`Could not sync user ${data.user.id} to Prisma: ${syncErr instanceof Error ? syncErr.message : syncErr}`);
    }

    return true;
  }
}
