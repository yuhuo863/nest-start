import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

/**
 * 数据库连接配置（抽离核心参数，适配多环境）
 * @param configService 环境变量配置服务
 * @returns DataSourceOptions 数据库连接配置
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): DataSourceOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'), // 增加默认值，提高鲁棒性
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USER', 'root'),
    password: configService.get<string>('DB_PASS', '123456'),
    database: configService.get<string>('DB_NAME', 'test'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 实体路径（相对于dist，编译后仍生效）
    synchronize: process.env.NODE_ENV !== 'production', // 生产环境关闭自动同步
    timezone: '+08:00', // 东八区时区
  };
};
