import { Module } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesController } from './time-entries.controller';
import { PrismaService } from 'src/prisma_database/prisma.service';


@Module({
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService, PrismaService],
  exports:[]
})
export class TimeEntriesModule {}
