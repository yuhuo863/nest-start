import { DynamicModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  OPTIONS_TYPE,
} from './auth.module-definition';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule extends ConfigurableModuleClass {
  // Demo：动态模块扩展自动生成的方法
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: AuthModule, // 指定模块
      ...options,
    };
  }
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: AuthModule, // 指定模块
      ...options,
    };
  }
}
