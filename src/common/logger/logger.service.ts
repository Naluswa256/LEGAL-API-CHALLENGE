import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  log(message: string, context?: string) {
    super.log(`[LOG] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`[ERROR] ${message}`, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(`[WARN] ${message}`, context);
  }
}
