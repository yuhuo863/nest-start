import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from './user.providers';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    DatabaseModule,
    // 配置JWT模块（生产环境建议用ConfigModule加载环境变量）
    JwtModule.register({
      global: true, // 全局可用，无需在其他模块重复导入
      secret: process.env.JWT_SECRET || 'your-strong-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [...userProviders, UserService, AuthGuard],
  controllers: [UserController], // 注册控制器
  exports: [UserService],
})
export class UserModule {}
