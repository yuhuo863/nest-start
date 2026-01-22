import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { format, transports, LoggerOptions } from 'winston';
import { DatabaseTransport } from '../database/transports/database.transport';
import { LogEntity } from '../shared/logger/entities/log.entity';

/**
 * Winston 日志配置工厂（抽离核心配置逻辑）
 * @param configService 环境变量配置
 * @param dataSource 数据库连接
 * @returns LoggerOptions 配置对象
 */
export const getWinstonConfig = async (
  configService: ConfigService,
  dataSource: DataSource,
): Promise<LoggerOptions> => {
  const isProduction = process.env.NODE_ENV === 'production';

  // 确保数据库连接已初始化
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  // 数据库日志传输配置
  const logRepository = dataSource.getRepository(LogEntity);
  const dbTransport = new DatabaseTransport(logRepository, {
    level: configService.get<string>('LOG_DB_LEVEL', 'warn'), // 默认仅记录警告及以上级别的日志
  });

  // 核心Winston配置
  return {
    level: isProduction ? 'info' : 'debug',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    defaultMeta: {
      service: configService.get<string>('APP_NAME') || 'nestjs-app',
    },
    transports: [
      // 控制台传输
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.printf(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            (info) => `${info.timestamp} ${info.level}: ${info.message}`,
          ),
        ),
      }),
      // 数据库传输
      dbTransport,
    ],
  };
};
