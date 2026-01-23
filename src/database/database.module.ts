import { Global, Module } from '@nestjs/common';
import { DATA_SOURCE } from '../config/constants';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DATA_SOURCE, // 令牌，在其他地方可以直接注入这个服务提供程序
      useFactory: async (configService: ConfigService) => {
        const dataSourceOptions = getDatabaseConfig(configService);
        const dataSource = new DataSource(dataSourceOptions);
        return dataSource.initialize();
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATA_SOURCE], // 可以直接使用服务提供程序本身({...}), 也可以只使用其令牌（provide值）
})
export class DatabaseModule {}
