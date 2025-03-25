import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma_database/prisma.service';
;

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('health')
  async healthCheck() {
    try {
      this.prisma.findManyUsers({ take: 1 });
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      });
    }
  }
}