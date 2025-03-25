
import {
    Controller,
    Get,
    Param,
    Res,
    UseGuards,
    NotFoundException,
    Req,
  } from '@nestjs/common';

  import { Response } from 'express';
  import * as fs from 'fs';
  import * as path from 'path';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { DocumentsService } from './documents.service';
import { AuthenticatedRequest } from 'src/auth/interfaces/express-user.interface';

  @Controller('public/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class DocumentsPublicController {
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Get(':id')
    @Roles('ADMIN', 'LAWYER')
    async getDocument(
      @Param('id') id: string,
      @Res() res: Response,
      @Req() req: AuthenticatedRequest,  
    ) {
      const document = await this.documentsService.findOne(id, req.user);
  
      if (!document) {
        throw new NotFoundException('Document not found');
      }
  
      const filePath = path.join(process.cwd(), document.fileUrl);
      
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }
  
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
      
      return res.sendFile(filePath);
    }
  }