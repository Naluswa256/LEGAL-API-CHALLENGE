
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
import { RegisterDto } from './dto/signup.input';
import { LoginDto } from './dto/login.input';
import { RefreshTokenDto } from './dto/refresh-token.input';


  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(
        registerDto.email,
        registerDto.password,
        registerDto.fullName,
      );
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto.email, loginDto.password);
    }
  
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
      return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
  }