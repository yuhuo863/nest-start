import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DATA_SOURCE } from '../constants';

export const databaseProviders = [
  {
    provide: DATA_SOURCE, // 自定义一个提供者，命名为DATA_SOURCE
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 实体文件路径
        synchronize: process.env.NODE_ENV !== 'production', // 生产环境关闭自动同步
        logging: process.env.NODE_ENV !== 'production', // 生产环境关闭日志输出
        timezone: '+08:00', // 设置时区为东八区
      });
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
