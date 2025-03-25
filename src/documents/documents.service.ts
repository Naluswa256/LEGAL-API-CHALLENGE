import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileUploadConfig } from '../common/configs/file-upload.config';
import { FileUtil } from '../utils/file.util';
import { PrismaService } from 'src/prisma_database/prisma.service';
import { AuthenticatedRequest } from 'src/auth/interfaces/express-user.interface';
import { UserRole } from 'src/users/entities/user.entity';


@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto & { caseId: string },
    user: AuthenticatedRequest['user'],
  ) {
    // Verify file type and size
    if (!FileUploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    if (file.size > FileUploadConfig.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${FileUploadConfig.maxFileSize} bytes)`,
      );
    }

    // Verify the case exists and belongs to the lawyer (if not admin)
    const caseRecord = this.prisma.findCaseById(createDocumentDto.caseId);
    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      caseRecord.lawyerId !== user.id
    ) {
      throw new ForbiddenException('Case not assigned to you');
    }

    // Save file to storage
    const fileUrl = await FileUtil.saveFile(file, createDocumentDto.caseId);

    // Create document record
    const newDocument = this.prisma.createDocument({
      caseId: createDocumentDto.caseId,
      lawyerId: user.id,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: createDocumentDto.description,
    });

    return this.prisma.findDocumentById(newDocument.id, {
      case: true,
      lawyer: true,
    });
  }

  async findByCase(caseId: string, user: AuthenticatedRequest['user']) {
    // Verify the case exists and belongs to the lawyer (if not admin)
    const caseRecord = this.prisma.findCaseById(caseId);
    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      caseRecord.lawyerId !== user.id
    ) {
      throw new ForbiddenException('Not authorized to access these documents');
    }

    return this.prisma.findManyDocuments({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
      include: {
        case: true,
        lawyer: true,
      },
    });
  }

  async deleteDocument(id: string, user: AuthenticatedRequest['user']) {
    const document = this.prisma.findDocumentById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      document.lawyerId !== user.id
    ) {
      throw new ForbiddenException('Not authorized to delete this document');
    }

    // Delete the physical file
    await FileUtil.deleteFile(document.fileUrl);

    // Delete the document record
    this.prisma.deleteDocument(id);

    return { message: 'Document deleted successfully' };
  }

  async findOne(
    documentId: string,
    user: AuthenticatedRequest['user'],
  ) {
    const document = this.prisma.findDocumentById(documentId, {
      case: true,
      lawyer: true,
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      document.lawyerId !== user.id
    ) {
      throw new ForbiddenException('Not authorized to view this document');
    }

    return document;
  }
}