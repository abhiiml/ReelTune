import { Injectable, OnModuleInit, OnModuleDestroy, Global, Module } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly db = db;

  async onModuleInit() {
    // Connection is lazily established by default in Prisma 8.
    // We can perform a dummy query to ensure it's connected at startup.
    // await this.db.orm.public.User.findFirst();
  }

  async onModuleDestroy() {
    // Prisma 8 RC connection teardown (if applicable)
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
