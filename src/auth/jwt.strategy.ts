import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtDto } from './dto/jwt.dto';
import { PrismaService } from 'src/prisma_database/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtDto) {
    console.log('🔹 Validating JWT Payload:', payload);
    const user = this.prisma.findUserById(payload.userId);
    
    if (!user) {
      console.error('❌ User not found for ID:', payload.userId);
      throw new UnauthorizedException('User not found');
    }

    console.log('✅ User authenticated:', user.id);
    
    return user;
  }
}