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
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    // 配置模块，用于读取环境变量等操作
    ConfigModule.forRoot({ isGlobal: true }),
    // 配置 JWT 模块，用于生成和验证 JWT
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
    // 配置 TypeORM 模块，用于数据库操作
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
    // 缓存模块，用于在应用程序中实现缓存功能
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          // 数组中的第一个存储是默认存储，其余的存储是备用存储
          stores: [
            // 默认存储: 内存缓存策略（TTL为60秒，最大容量5000个条目）
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }), // 缓存策略：内存中存储，TTL为60秒，最大容量5000个条目
            }),
            // 备用存储: Redis 缓存策略（默认TTL为60秒）
            new KeyvRedis('redis://localhost:6379'),
            // 更多备用存储...
          ],
          ttl: 60000, // 全局缓存时间 60秒
        };
      },
    }),
    // 认证模块，包含用户登录、注册等功能
    AuthModule.forRoot({
      folder: './config',
      isGlobal: false, // 为演示动态模块的额外选项, isGlobal 被声明为“额外”属性
    }),
    // AuthModule.forRootAsync({
    // 默认情况下，AuthModuleOptionsFactory 类必须提供一个名为 create() 的方法,
    // 这里通过自定义选项工厂类方法 #setFactoryMethodName() 可以自定义方法名为 'createAuthModuleOptions'（而不是 create）
    //   // useClass: AuthModuleOptionsFactory,
    // }),
    UserModule, // 用户模块，包含用户查询、更新等功能
    LoggerModule, // 全局模块 用于日志记录等操作
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
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // 自动缓存响应: 所有请求端点自动缓存响应数据
    },
    {
      provide: APP_PIPE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new ValidationPipe({
          whitelist: true, // 剥离非白名单属性
          forbidNonWhitelisted: config.get('NODE_ENV') !== 'production', // 发现非白名单属性时抛出异常
          transform: true, // 自动转换实体属性到DTO类型（例如，将字符串转换为数字）
        });
      },
      // 使用 useClass 直接使用类实例：
      // useClass: ValidationPipe,
      // 或者使用 useValue 直接创建实例：
      // useValue: new ValidationPipe({
      //   whitelist: true, // 剥离非白名单属性
      //   forbidNonWhitelisted: true, // 发现非白名单属性时抛出异常
      //   transform: true, // 自动转换实体属性到DTO类型（例如，将字符串转换为数字）
      // }),
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
