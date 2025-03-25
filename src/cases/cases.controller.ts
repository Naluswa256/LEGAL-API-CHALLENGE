// src/cases/cases.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CaseStatus } from './entities/case.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CasesService } from './cases.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/express-user.interface';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @Roles(UserRole.LAWYER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCaseDto: CreateCaseDto, @Req() req: AuthenticatedRequest) {
    return this.casesService.create(createCaseDto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  findAll(@Query() query: any, @Req() req: AuthenticatedRequest) {
    const { status, clientName, sort, page = 1, limit = 10 } = query;
    const [orderBy, orderDir] = sort?.split(':') || [];

    const options = {
      where: {
        ...(status && { status }),
        ...(clientName && { clientName: { contains: clientName } }),
      },
      sort: orderBy ? { orderBy, orderDir } : undefined,
      pagination: {
        skip: (page - 1) * limit,
        take: +limit,
      },
    };

    return req.user.role === UserRole.ADMIN
      ? this.casesService.findAll(options)
      : this.casesService.findByLawyer(req.user.id, options);
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  searchCases(@Query() query: any, @Req() req: AuthenticatedRequest) {
    const { q: searchTerm, status, sort } = query;
    const [orderBy, orderDir] = sort?.split(':') || [];

    return this.casesService.searchCases(searchTerm, req.user, {
      where: status ? { status } : undefined,
      sort: orderBy ? { orderBy, orderDir } : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.casesService.findOne(id, req.user);
  }

  @Get(':id/time-entries')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  async getCaseTimeEntries(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const caseRecord = await this.casesService.findOne(id, req.user);
    return this.casesService.getCaseTimeEntries(id, req.user);
  }

  @Get(':id/total-hours')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  getTotalBillableHours(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.casesService.getTotalBillableHours(id, req.user);
  }

  @Put(':id')
  @Roles(UserRole.LAWYER)
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.casesService.update(id, updateCaseDto, req.user);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  changeStatus(
    @Param('id') id: string,
    @Query('status') status: CaseStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.casesService.changeStatus(id, status, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LAWYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.casesService.remove(id, req.user);
  }
}