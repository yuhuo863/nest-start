import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthGuard } from './guards/auth.guard';
import { DATA_SOURCE, USER_REPOSITORY } from '../../config/constants';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

// 定义一个模块，用于管理用户相关的服务和控制器
@Module({
  imports: [],
  providers: [
    UserService,
    AuthGuard,
    {
      provide: USER_REPOSITORY,
      useFactory: (dataSource: DataSource) => dataSource.getRepository(User), // 注入数据源，并获取User的仓库
      inject: [DATA_SOURCE],
    },
  ],
  controllers: [UserController], // 注册控制器，以便处理HTTP请求
  exports: [UserService], // 允许在其他模块中导入UserService
})
export class UserModule {}
