import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    const startTime = process.hrtime();

    res.on('finish', () => {
      const { statusCode } = res;

      const diff = process.hrtime(startTime);
      const timeInMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      const logMessage = `${method} ${originalUrl} ${statusCode} - ${timeInMs}ms - ${ip} [${userAgent}]`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
