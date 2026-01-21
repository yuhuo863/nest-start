import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from './user.providers';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [DatabaseModule], // 导入数据库模块，以便使用数据库服务
  providers: [...userProviders, UserService, AuthGuard], // 注册服务提供者，以便在其他模块中使用它们
  controllers: [UserController], // 注册控制器，以便处理HTTP请求
  exports: [UserService], // 允许在其他模块中导入UserService
})
export class UserModule {}
