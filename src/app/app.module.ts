import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../shared/filters/all-exceptions.filter';
import { LoggerModule } from '../shared/logger/logger.module';
import { AppController } from './app.controller';
import { UserModule } from '../modules/user/user.module';
import { DatabaseModule } from '../database/database.module';
import { UserMiddleware } from '../common/middleware/user.middleware';
import { UserController } from '../modules/user/user.controller';

@Module({
  imports: [
    // 全局加载.env
    ConfigModule.forRoot({ isGlobal: true }),
    // 配置JWT模块（生产环境建议用ConfigModule加载环境变量）
    JwtModule.register({
      global: true, // 全局可用，无需在其他模块重复导入
      secret: process.env.JWT_SECRET || 'your-strong-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    UserModule, // 用户模块，包含用户注册、登录等功能
    LoggerModule, // 全局模块 用于日志记录等操作
    DatabaseModule, // 全局模块 用于数据库连接等操作
    // 其他模块...
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 配置指定路由守卫、拦截器等中间件
    consumer.apply(UserMiddleware).forRoutes(UserController);
  }
}
