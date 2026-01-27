import { Module } from '@nestjs/common';
import { DATA_SOURCE } from '../config/constants';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [DATA_SOURCE], // 可以直接使用服务提供程序本身({...databaseProviders}), 也可以只使用其令牌[token]（provide值）
})
export class DatabaseModule {}
