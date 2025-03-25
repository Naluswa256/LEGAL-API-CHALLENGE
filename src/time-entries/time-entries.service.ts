import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { AuthenticatedRequest } from 'src/auth/interfaces/express-user.interface';
import { UserRole } from 'src/users/entities/user.entity';
import { PrismaService } from 'src/prisma_database/prisma.service';


@Injectable()
export class TimeEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyCaseAccess(caseId: string, userId: string, role: UserRole) {
    const caseRecord = this.prisma.findCaseById(caseId);
    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (role !== UserRole.ADMIN && caseRecord.lawyerId !== userId) {
      throw new ForbiddenException('Case not assigned to you');
    }

    return caseRecord;
  }

  async create(
    createTimeEntryDto: CreateTimeEntryDto & { caseId: string },
    user: AuthenticatedRequest['user'],
  ) {
    await this.verifyCaseAccess(createTimeEntryDto.caseId, user.id, user.role);

    if (createTimeEntryDto.hours <= 0) {
      throw new BadRequestException('Hours must be greater than 0');
    }

    const newTimeEntry = this.prisma.createTimeEntry({
      caseId: createTimeEntryDto.caseId,
      lawyerId: user.id,
      hours: createTimeEntryDto.hours,
      description: createTimeEntryDto.description,
    });

    return this.prisma.findTimeEntryById(newTimeEntry.id, {
      case: true,
      lawyer: true,
    });
  }


async findAll(
  caseId: string,
  user: AuthenticatedRequest['user'],
  options?: {
    where?: any;
    sort?: {
      orderBy?: 'createdAt' | 'hours' | 'workDate';
      orderDir?: 'asc' | 'desc';
    };
    pagination?: { skip: number; take: number };
  },
) {
  await this.verifyCaseAccess(caseId, user.id, user.role);

  const { where, sort, pagination } = options || {};
  const orderBy = sort?.orderBy ? {
    [sort.orderBy]: sort.orderDir || 'desc'
  } : { createdAt: 'desc' };

  return this.prisma.findManyTimeEntries({
    where: {
      caseId,
      ...where,
    },
    orderBy,
    skip: pagination?.skip,
    take: pagination?.take,
    include: {
      case: true,
      lawyer: true,
    },
  });
}

  async getTotalBillableHours(
    caseId: string,
    user: AuthenticatedRequest['user'],
  ) {
    await this.verifyCaseAccess(caseId, user.id, user.role);

    const timeEntries = this.prisma.findManyTimeEntries({
      where: { caseId },
    });

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return {
      caseId,
      totalHours,
      entriesCount: timeEntries.length,
    };
  }

  async findOne(
    caseId: string,
    id: string,
    user: AuthenticatedRequest['user'],
  ) {
    await this.verifyCaseAccess(caseId, user.id, user.role);

    const timeEntry = this.prisma.findTimeEntryById(id, {
      case: true,
      lawyer: true,
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (timeEntry.caseId !== caseId) {
      throw new BadRequestException('Time entry does not belong to this case');
    }

    if (user.role !== UserRole.ADMIN && timeEntry.lawyerId !== user.id) {
      throw new ForbiddenException('Not authorized to view this time entry');
    }

    return timeEntry;
  }

  async update(
    caseId: string,
    id: string,
    updateTimeEntryDto: UpdateTimeEntryDto,
    user: AuthenticatedRequest['user'],
  ) {
    await this.verifyCaseAccess(caseId, user.id, user.role);

    const existingEntry = this.prisma.findTimeEntryById(id);
    if (!existingEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (existingEntry.caseId !== caseId) {
      throw new BadRequestException('Time entry does not belong to this case');
    }

    if (user.role !== UserRole.ADMIN && existingEntry.lawyerId !== user.id) {
      throw new ForbiddenException('Not authorized to update this time entry');
    }

    if (updateTimeEntryDto.hours && updateTimeEntryDto.hours <= 0) {
      throw new BadRequestException('Hours must be greater than 0');
    }

    const updatedEntry = this.prisma.updateTimeEntry(id, {
      hours: updateTimeEntryDto.hours,
      description: updateTimeEntryDto.description,
    });

    return this.prisma.findTimeEntryById(updatedEntry.id, {
      case: true,
      lawyer: true,
    });
  }

  async remove(
    caseId: string,
    id: string,
    user: AuthenticatedRequest['user'],
  ) {
    await this.verifyCaseAccess(caseId, user.id, user.role);

    const timeEntry = this.prisma.findTimeEntryById(id);
    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (timeEntry.caseId !== caseId) {
      throw new BadRequestException('Time entry does not belong to this case');
    }

    if (user.role !== UserRole.ADMIN && timeEntry.lawyerId !== user.id) {
      throw new ForbiddenException('Not authorized to delete this time entry');
    }

    this.prisma.deleteTimeEntry(id);

    return { message: 'Time entry deleted successfully' };
  }
}