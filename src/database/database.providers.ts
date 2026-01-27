import { DATA_SOURCE } from '../config/constants';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: DATA_SOURCE, // 令牌，在其他地方可以直接注入这个服务提供程序
    useFactory: async (configService: ConfigService) => {
      const dataSourceOptions = getDatabaseConfig(configService);
      const dataSource = new DataSource(dataSourceOptions);
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
