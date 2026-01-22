import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../config/constants'; // 数据库 token
import { DatabaseModule } from '../../database/database.module'; // 导入数据库模块
import { getWinstonConfig } from '../../config/logger.config';

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
        return getWinstonConfig(configService, dataSource);
      },
    }),
  ],
})
export class LoggerModule {}
