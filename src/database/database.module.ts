import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { DATA_SOURCE } from '../config/constants';

@Global() // 全局模块，在其他地方可以直接注入
@Module({
  providers: [...databaseProviders],
  exports: [DATA_SOURCE], // 可以直接使用服务提供程序本身(...databaseProviders), 也可以只使用其令牌（provide值）
})
export class DatabaseModule {}
