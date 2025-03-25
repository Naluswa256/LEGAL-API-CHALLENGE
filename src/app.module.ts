
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import config from './common/configs/config';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/rate-limiter.guard';
import { APP_GUARD } from '@nestjs/core';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { DocumentsModule } from './documents/documents.module';
import { CasesModule } from './cases/cases.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaService } from './prisma_database/prisma.service';
import { LoggerService } from './common/logger/logger.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 3,
        },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    TimeEntriesModule,
    DocumentsModule,
    CasesModule,
  ],
  controllers: [AppController],
  providers: [AppService,  {
    provide: APP_GUARD,
    useClass: CustomThrottlerGuard,
  },
  PrismaService,
  LoggerService,
],
exports:[PrismaService, LoggerService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}