import { Module } from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { AdminUsersController } from './users.controller';
import { PrismaService } from 'src/prisma_database/prisma.service';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService,PrismaService]
})
export class UsersModule {}
