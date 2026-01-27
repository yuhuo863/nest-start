import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../modules/user/guards/auth.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth() {
  // 装饰器组合, 使用applyDecorators来组合多个装饰器, 用于简化控制器方法的身份验证和Swagger文档配置
  return applyDecorators(
    UseGuards(AuthGuard), // 使用AuthGuard守卫进行身份验证
    ApiBearerAuth(), // 使用Bearer认证方式
    ApiUnauthorizedResponse({ description: 'Unauthorized' }), // 示例: 添加未授权的响应描述
  );
}
