import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { PrismaModule } from './prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [SupabaseModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
