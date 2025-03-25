import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SecurityConfig } from '../common/configs/config.interface';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma_database/prisma.service';


@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),

  ],
  providers: [
    AuthService,
    JwtStrategy,
    PasswordService,
    PrismaService
  ],
  controllers:[AuthController],
  exports: [],
})
export class AuthModule {}
