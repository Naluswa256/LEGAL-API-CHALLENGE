
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
} from '@nestjs/common';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntriesService } from './time-entries.service';
import { AuthenticatedRequest } from 'src/auth/interfaces/express-user.interface';
import { TimeEntryQueryDto } from './dto/find-all-time-entries.dto';

@Controller('cases/:caseId/time-entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @Roles('LAWYER')
  create(
    @Param('caseId') caseId: string,
    @Body() createTimeEntryDto: CreateTimeEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.create(
      { ...createTimeEntryDto, caseId },
      req.user,
    );
  }

  @Get()
  @Roles('ADMIN', 'LAWYER')
  findAll(
    @Param('caseId') caseId: string,
    @Query() query: TimeEntryQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.findAll(caseId, req.user, {
      where: {
        ...(query.hours && { hours: { equals: query.hours } }),
      },
      sort: query.sort, 
      pagination: {
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      },
    });
  }
  @Get('total-hours')
  @Roles('ADMIN', 'LAWYER')
  getTotalBillableHours(
    @Param('caseId') caseId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.getTotalBillableHours(caseId, req.user);
  }

  @Get(':id')
  @Roles('ADMIN', 'LAWYER')
  findOne(
    @Param('caseId') caseId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.findOne(caseId, id, req.user);
  }

  @Put(':id')
  @Roles('LAWYER')
  update(
    @Param('caseId') caseId: string,
    @Param('id') id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.update(
      caseId,
      id,
      updateTimeEntryDto,
      req.user,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'LAWYER')
  remove(
    @Param('caseId') caseId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timeEntriesService.remove(caseId, id, req.user);
  }
}