// src/modules/documents/documents.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { FileUploadConfig } from 'src/common/configs/file-upload.config';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AuthenticatedRequest } from 'src/auth/interfaces/express-user.interface';

@Controller('cases/:caseId/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles('LAWYER')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('caseId') caseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FileUploadConfig.maxFileSize }),
          new FileTypeValidator({ fileType: new RegExp(FileUploadConfig.allowedMimeTypes.join('|')) }),
        ],
      })
    ) file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentsService.create(
      file,
      { ...createDocumentDto, caseId },
      req.user,
    );
  }

  @Get()
  @Roles('ADMIN', 'LAWYER')
  findAll(@Param('caseId') caseId: string, @Req() req: AuthenticatedRequest) {
    return this.documentsService.findByCase(caseId, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'LAWYER')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.documentsService.deleteDocument(id, req.user);
    return { message: 'Document deleted successfully' };
  }
}