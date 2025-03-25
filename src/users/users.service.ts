import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma_database/prisma.service';
import { UserRole } from './entities/user.entity';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdmin(createUserDto: CreateUserDto) {
    await this.validateEmail(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.createUser({
      ...createUserDto,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
    });
  }

  async createLawyer(createUserDto: CreateUserDto) {
    await this.validateEmail(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.createUser({
      ...createUserDto,
      passwordHash: hashedPassword,
      role: UserRole.LAWYER,
    });
  }

  async findAll(options?: {
    where?: any;
    sort?: { orderBy: string; orderDir: string };
    pagination?: { skip: number; take: number };
  }) {
    const { where, sort, pagination } = options || {};

    return this.prisma.findManyUsers({
      where,
      orderBy: sort ? { [sort.orderBy]: sort.orderDir } : undefined,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        cases: true,
        timeEntries: true,
        documents: true,
      },
    });
  }

  async findOne(id: string) {
    const user = this.prisma.findUserById(id, {
      cases: true,
      timeEntries: true,
      documents: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.prisma.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.validateEmail(updateUserDto.email);
    }

    return this.prisma.updateUser(id, data);
  }

  async remove(id: string) {
    const user = this.prisma.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has associated records
    const [cases, timeEntries, documents] = await Promise.all([
      this.prisma.findManyCases({ where: { lawyerId: id } }),
      this.prisma.findManyTimeEntries({ where: { lawyerId: id } }),
      this.prisma.findManyDocuments({ where: { lawyerId: id } }),
    ]);

    if (cases.length > 0 || timeEntries.length > 0 || documents.length > 0) {
      throw new BadRequestException(
        'Cannot delete user with associated cases, time entries, or documents',
      );
    }

    return this.prisma.deleteUser(id);
  }

  private async validateEmail(email: string) {
    const users = this.prisma.findManyUsers({
      where: { email },
      take: 1,
    });

    if (users.length > 0) {
      throw new ConflictException('Email already in use');
    }
  }
}