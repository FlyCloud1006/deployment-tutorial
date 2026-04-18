// ========== NestJS Winston 日志（NestJS）==========
// examples/stage3-java-vs-nestjs/06-logging/nestjs-winston.ts

import { Module, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (Object.keys(meta).length) log += ` ${JSON.stringify(meta)}`;
    if (stack) log += `\n${stack}`;
    return log;
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production'
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '30d',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
  ],
});

@Injectable()
export class AppLogger implements NestLoggerService {
  log(message: string, context?: string) { logger.info(message, { context }); }
  error(message: string, trace?: string, context?: string) { logger.error(message, { trace, context }); }
  warn(message: string, context?: string) { logger.warn(message, { context }); }
  debug(message: string, context?: string) { logger.debug(message, { context }); }
  verbose(message: string, context?: string) { logger.verbose(message, { context }); }
}
