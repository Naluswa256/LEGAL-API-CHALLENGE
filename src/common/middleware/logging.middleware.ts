import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    this.logger.log(`➡️ ${method} ${originalUrl}`, 'Request');

    res.on('finish', () => {
      this.logger.log(
        `⬅️ ${method} ${originalUrl} - ${res.statusCode}`,
        'Response',
      );
    });

    next();
  }
}
