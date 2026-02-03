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
import { AppController } from './app.controller';
import { UserController } from '../modules/user/user.controller';
import { HttpExceptionsFilter } from '../shared/filters/http-exception.filter';
import { LoggingInterceptor } from '../shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '../shared/interceptors/transform.interceptor';
import { UserMiddleware } from '../common/middleware/user.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    // 配置模块，用于读取环境变量等操作
    ConfigModule.forRoot({ isGlobal: true }),
    // 配置 JWT 模块，用于生成和验证 JWT
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        timezone: '+08:00',
      }),
    }),
    UserModule, // 用户模块，包含用户查询、更新等功能
    LoggerModule, // 全局模块 用于日志记录等操作
    AuthModule.forRoot({
      folder: './config',
      isGlobal: false, // 为演示动态模块的额外选项, isGlobal 被声明为“额外”属性
    }),
    // AuthModule.forRootAsync({
    // 默认情况下，AuthModuleOptionsFactory 类必须提供一个名为 create() 的方法,
    // 这里通过自定义选项工厂类方法 #setFactoryMethodName() 可以自定义方法名为 'createAuthModuleOptions'（而不是 create）
    //   // useClass: AuthModuleOptionsFactory,
    // }),
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
  constructor(private dataSource: DataSource) {
    // 比如：打印所有已加载的实体名称
    const entities = this.dataSource.entityMetadatas.map((meta) => meta.name);
    console.log('已加载的实体:', entities);
  }
  configure(consumer: MiddlewareConsumer) {
    // 配置指定路由守卫、拦截器等中间件
    consumer.apply(UserMiddleware).forRoutes(UserController);
  }
}
