import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response, Request } from 'express';
  import { LoggerService } from '../logger/logger.service';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'An unexpected error occurred';
      let errorDetails: any = null;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const errorResponse = exception.getResponse();
  
        if (typeof errorResponse === 'string') {
          message = errorResponse;
        } else if (typeof errorResponse === 'object' && errorResponse !== null) {
          message = errorResponse['message'] || 'Unknown error';
          errorDetails = errorResponse;
        }
      } else if (exception instanceof Error) {
        message = exception.message;
        errorDetails = { stack: exception.stack };
      }
  
      this.logger.error(
        `❌ [${status}] ${message}`,
        JSON.stringify({
          method: request.method,
          path: request.url,
          body: request.body,
          query: request.query,
          errorDetails,
        }),
      );
  
      response.status(status).json({
        success: false,
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
  