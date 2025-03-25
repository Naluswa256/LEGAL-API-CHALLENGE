import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsPublicController } from './documents-public.controller';
import { PrismaService } from 'src/prisma_database/prisma.service';


@Module({
  controllers: [DocumentsController, DocumentsPublicController],
  providers: [DocumentsService, PrismaService],
})
export class DocumentsModule {}
