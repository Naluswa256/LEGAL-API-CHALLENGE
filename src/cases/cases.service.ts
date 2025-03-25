import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { PrismaService } from 'src/prisma_database/prisma.service';
import { CaseStatus } from './entities/case.entity';
import { User, UserRole } from 'src/users/entities/user.entity';



@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCaseDto: CreateCaseDto, user: User) {
    const lawyer = this.prisma.findUserById(user.id);
    if (!lawyer || lawyer.role !== UserRole.LAWYER) {
      throw new BadRequestException('Current user is not a valid attorney');
    }
    
    // Also need to await this create operation
    const newCase = this.prisma.createCase({
      lawyerId: user.id,
      clientName: createCaseDto.clientName,
      clientEmail: createCaseDto.clientEmail
    });
  
    return this.prisma.findCaseById(newCase.id, {
      lawyer: true,
      timeEntries: true,
      documents: true,
    });
  }

  async findAll(options: {
    where?: any;
    sort?: { orderBy: string; orderDir: string };
    pagination?: { skip: number; take: number };
  }) {
    const { where, sort, pagination } = options;

    return this.prisma.findManyCases({
      where,
      orderBy: sort ? { [sort.orderBy]: sort.orderDir } : undefined,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        lawyer: true,
        timeEntries: true,
        documents: true,
      },
    });
  }

  async findByLawyer(
    lawyerId: string,
    options: {
      where?: any;
      sort?: { orderBy: string; orderDir: string };
      pagination?: { skip: number; take: number };
    },
  ) {
    const { where, sort, pagination } = options;

    return this.prisma.findManyCases({
      where: {
        ...where,
        lawyerId,
      },
      orderBy: sort ? { [sort.orderBy]: sort.orderDir } : undefined,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        lawyer: true,
        timeEntries: true,
        documents: true,
      },
    });
  }

  async searchCases(
    searchTerm: string,
    user: any,
    options: {
      where?: any;
      sort?: { orderBy: string; orderDir: string };
    },
  ) {
    const { where, sort } = options;
    const baseWhere = {
      ...(where || {}),
      OR: [
        { clientName: { contains: searchTerm } },
        { clientEmail: { contains: searchTerm } },
      ],
    };

    const whereClause =
      user.role === UserRole.ADMIN
        ? baseWhere
        : { ...baseWhere, lawyerId: user.id };

    return this.prisma.findManyCases({
      where: whereClause,
      orderBy: sort ? { [sort.orderBy]: sort.orderDir } : undefined,
      include: {
        lawyer: true,
        timeEntries: true,
        documents: true,
      },
    });
  }

  async findOne(id: string, user: User) {
    const caseRecord = this.prisma.findCaseById(id, {
      lawyer: true,
      timeEntries: true,
      documents: true,
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (user.role !== UserRole.ADMIN && caseRecord.lawyerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this case',
      );
    }

    return caseRecord;
  }

  async getCaseTimeEntries(id: string, user: User) {
    await this.findOne(id, user); // Verify access first

    return this.prisma.findManyTimeEntries({
      where: { caseId: id },
      include: {
        case: true,
        lawyer: true,
      },
    });
  }

  async getTotalBillableHours(id: string, user: User) {
    await this.findOne(id, user); // Verify access first

    const timeEntries = this.prisma.findManyTimeEntries({
      where: { caseId: id },
    });

    return {
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
    };
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, user: User) {
    const caseRecord = await this.findOne(id, user);

    if (caseRecord.lawyerId !== user.id) {
      throw new ForbiddenException(
        'Only the assigned lawyer can update this case',
      );
    }

    const updatedCase = this.prisma.updateCase(id, updateCaseDto);
    return this.prisma.findCaseById(updatedCase.id, {
      lawyer: true,
      timeEntries: true,
      documents: true,
    });
  }

  async changeStatus(id: string, status: CaseStatus, user: User) {
    const caseRecord = await this.findOne(id, user);

    if (
      user.role !== UserRole.ADMIN &&
      caseRecord.lawyerId !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to change this case status',
      );
    }

    if (!Object.values(CaseStatus).includes(status)) {
      throw new BadRequestException('Invalid status value');
    }

    const updatedCase = this.prisma.updateCase(id, { status });
    return this.prisma.findCaseById(updatedCase.id, {
      lawyer: true,
      timeEntries: true,
      documents: true,
    });
  }

  async remove(id: string, user: User) {
    const caseRecord = await this.findOne(id, user);

    if (
      user.role !== UserRole.ADMIN &&
      caseRecord.lawyerId !== user.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this case',
      );
    }

    const [timeEntries, documents] = await Promise.all([
      this.prisma.findManyTimeEntries({ where: { caseId: id } }),
      this.prisma.findManyDocuments({ where: { caseId: id } }),
    ]);

    if (timeEntries.length > 0 || documents.length > 0) {
      throw new BadRequestException(
        'Cannot delete case with associated time entries or documents',
      );
    }

    this.prisma.deleteCase(id);
  }
}