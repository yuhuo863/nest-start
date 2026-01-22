import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DATA_SOURCE } from '../config/constants';
import { getDatabaseConfig } from '../config/database.config';

export const databaseProviders = [
  {
    provide: DATA_SOURCE, // Provide a unique name for the data source
    useFactory: async (configService: ConfigService) => {
      const dataSourceOptions = getDatabaseConfig(configService);
      const dataSource = new DataSource(dataSourceOptions);
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
