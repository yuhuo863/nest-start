import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { format, transports } from 'winston';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../constants'; // 数据库 token
import { DatabaseModule } from '../../database/database.module'; // 导入数据库模块
import { DatabaseTransport } from '../../database/database.transport'; // 导入自定义的数据库传输模块
import { LogEntity } from './log.entity';

@Global() // 让模块全局可用，无需在每个模块重复导入
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [DatabaseModule], // 让 DATA_SOURCE 在此动态模块中可用
      inject: [ConfigService, DATA_SOURCE], // ← 注入 ConfigService 和 DATA_SOURCE
      useFactory: async (
        configService: ConfigService,
        dataSource: DataSource,
      ) => {
        const isProduction = process.env.NODE_ENV === 'production';

        // 可选：确保 DataSource 已初始化
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }

        const logRepository = dataSource.getRepository(LogEntity);
        const dbTransport = new DatabaseTransport(logRepository); // 创建数据库传输实例

        return {
          level: isProduction ? 'info' : 'debug', // 生产环境使用 'info'，开发环境使用 'debug'
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(), // 用于将多个参数传递给日志记录器
            format.json(),
          ),
          defaultMeta: {
            service: configService.get<string>('APP_NAME') || 'nestjs-app',
          },
          transports: [
            new transports.Console({
              format: format.combine(
                format.colorize({ all: true }),
                format.printf(
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                ),
              ),
            }),
            dbTransport, // 添加数据库传输到日志配置中
          ],
        };
      },
    }),
  ],
})
export class LoggerModule {}
