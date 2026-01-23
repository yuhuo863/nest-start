import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../config/constants';
import { DatabaseModule } from '../../database/database.module';
import { getWinstonConfig } from '../../config/logger.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [DatabaseModule], // 导入数据库模块，确保能注入 DataSource
      inject: [ConfigService, DATA_SOURCE], // 注入配置服务和数据库连接实例
      // 生成 Winston 配置 (异步工厂模式)
      useFactory: async (
        configService: ConfigService,
        dataSource: DataSource,
      ) => {
        return getWinstonConfig(configService, dataSource);
      },
    }),
  ],
})
export class LoggerModule {}
