// Re-export PrismaClient for convenience.
// PrismaService (in prisma.service.ts) extends PrismaClient directly —
// use that instead of importing this file in application code.
export { PrismaClient } from '@prisma/client';
