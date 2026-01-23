import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthGuard } from './guards/auth.guard';
import { DATA_SOURCE, USER_REPOSITORY } from '../../config/constants';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [],
  providers: [
    UserService,
    AuthGuard,
    {
      // 注入 FactoryProvider 来创建 User 的 Repository
      provide: USER_REPOSITORY, // 定义一个提供者，用于在UserService中使用 @Inject(USER_REPOSITORY) 注入 User 对应的 Repository
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(UserEntity), // 使用数据源创建 User 对应的 Repository
      inject: [DATA_SOURCE], // 保证工厂函数能拿到全局注入的数据源实例，是创建 Repository 的前提。
    },
  ],
  controllers: [UserController], // 注册控制器，以便处理HTTP请求
  exports: [UserService], // 允许在其他模块中导入UserService
})
export class UserModule {}
