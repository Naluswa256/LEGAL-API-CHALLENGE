// src/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma_database/prisma.service';
import { Token } from './models/token.model';
import { UserRole } from 'src/users/entities/user.entity';
import { Auth } from './models/auth.model';
import { SecurityConfig } from 'src/common/configs/config.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}


  async register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<Auth> {
    // Check if user already exists
    const existingUser = this.prisma.findManyUsers({
      where: { email },
      take: 1,
    });
    if (existingUser.length > 0) {
      throw new ConflictException(`Email ${email} already used`);
    }

    // Hash password and create user
    const hashedPassword = await this.hashPassword(password);
    const user = this.prisma.createUser({
      email,
      passwordHash: hashedPassword,
      fullName,
      role: UserRole.LAWYER, // Default role
    });

    const tokens = this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    return {
      ...tokens,
      user: this.prisma.findUserById(user.id, {
        cases: true,
        timeEntries: true,
        documents: true,
      }),
    };
  }

  async login(email: string, password: string): Promise<Auth> {
    // Find user by email
    const users = this.prisma.findManyUsers({
      where: { email },
      take: 1,
    });
    const user = users[0];

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    // Validate password
    const passwordValid = await this.validatePassword(
      password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    return {
      ...tokens,
      user: this.prisma.findUserById(user.id, {
        cases: true,
        timeEntries: true,
        documents: true,
      }),
    };
  }

  async validateUser(userId: string) {
    return this.prisma.findUserById(userId);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(payload: { userId: string; role: UserRole }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: {
    userId: string;
    role: UserRole;
  }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: securityConfig.expiresIn,
    });
  }

  private generateRefreshToken(payload: {
    userId: string;
    role: UserRole;
  }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  async refreshToken(token: string) {
    try {
      const { userId, role } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
        role,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

