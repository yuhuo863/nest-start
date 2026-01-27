import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../modules/auth/auth.module';
import { LoggerModule } from '../shared/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UserModule } from '../modules/user/user.module';
import { DatabaseModule } from '../database/database.module';
import { AppController } from './app.controller';
import { UserController } from '../modules/user/user.controller';
import { HttpExceptionsFilter } from '../shared/filters/http-exception.filter';
import { LoggingInterceptor } from '../shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '../shared/interceptors/transform.interceptor';
import { UserMiddleware } from '../common/middleware/user.middleware';
import * as Joi from 'joi';

@Module({
  imports: [
    // 配置模块，用于读取环境变量等操作
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用，无需在其他模块重复导入
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'], // 根据环境加载不同的配置文件
      expandVariables: true, // 允许读取环境变量中的其他环境变量 (例如 NODE_ENV -> ${NODE_ENV})
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'), // 强制 NODE_ENV 为 development/production/test 其中之一，默认值为 development
        JWT_SECRET: Joi.string().min(16).required(), // 强制 JWT_SECRET 存在且长度≥16
        JWT_EXPIRES_IN: Joi.string().default('7d'), // 兜底默认值
      }),
    }),
    // 配置 JWT 模块，用于生成和验证 JWT
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 非空断言！：因 ConfigModule 已校验 JWT_SECRET 必传，可安全断言
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
    AuthModule, // 认证模块，包含用户注册、登录等功能
    UserModule, // 用户模块，包含用户查询、更新等功能
    LoggerModule, // 全局模块 用于日志记录等操作
    DatabaseModule, // 全局模块 用于数据库连接等操作
    // 其他模块...
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // 自定义日志拦截器
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // 自定义转换拦截器
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe, // 使用 NestJS 内置的验证管道
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter, // 自定义HTTP异常过滤器
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
