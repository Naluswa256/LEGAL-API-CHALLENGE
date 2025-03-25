import { forwardRef, Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { PrismaService } from 'src/prisma_database/prisma.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService,PrismaService],
  exports:[]
})
export class CasesModule {}
