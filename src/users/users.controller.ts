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
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AdminUsersService } from './users.service';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post('admins')
  @Roles(UserRole.ADMIN)
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.adminUsersService.createAdmin(createUserDto);
  }


  @Post('lawyers')
  @Roles(UserRole.ADMIN)
  createLawyer(@Body() createUserDto: CreateUserDto) {
    return this.adminUsersService.createLawyer(createUserDto);
  }


  @Get()
  findAll(@Query() query: any) {
    const { role, email, sort, page = 1, limit = 10 } = query;
    const [orderBy, orderDir] = sort?.split(':') || [];

    return this.adminUsersService.findAll({
      where: {
        ...(role && { role }),
        ...(email && { email: { contains: email } }),
      },
      sort: orderBy ? { orderBy, orderDir } : undefined,
      pagination: {
        skip: (page - 1) * limit,
        take: +limit,
      },
    });
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }


  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminUsersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.adminUsersService.remove(id);
  }
}
