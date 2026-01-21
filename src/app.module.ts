import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './shared/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局加载.env
    }),
    // 配置JWT模块（生产环境建议用ConfigModule加载环境变量）
    JwtModule.register({
      global: true, // 全局可用，无需在其他模块重复导入
      secret: process.env.JWT_SECRET || 'your-strong-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
