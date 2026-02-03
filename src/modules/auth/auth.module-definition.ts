import { ConfigurableModuleBuilder } from '@nestjs/common';
import { AuthModuleOptions } from './auth-module-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthModuleOptions>()
  .setClassMethodName('forRoot') // 自定义方法键 默认为register/registerAsync
  .setFactoryMethodName('createAuthModuleOptions') // 自定义工厂方法键 默认为create()
  .setExtras(
    // 自定义额外配置项
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();
