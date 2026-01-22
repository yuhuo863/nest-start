import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../shared/filters/all-exceptions.filter';
import { LoggerModule } from '../shared/logger/logger.module';
import { AppController } from './app.controller';
import { UserModule } from '../modules/user/user.module';

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
    UserModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
