import {
  ThrottlerGuard as BaseThrottlerGuard,
  ThrottlerException,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends BaseThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
      try {
          return await super.handleRequest(requestProps);
      } catch (error) {
          if (error instanceof ThrottlerException) {
              const response = requestProps.context.switchToHttp().getResponse<Response>();
              
              response.status(429).json({
                  success: false,
                  statusCode: 429,
                  message: 'Too many requests from this IP, please try again later.',
              });
              
              return false;
          }
          throw error;
      }
  }
}
