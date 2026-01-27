import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../../modules/user/interfaces/user.interface';

// 自定义装饰器，用于获取当前请求的 user 详细信息 E.g., @User() 或 @User('email')
export const User = createParamDecorator(
  (
    data: keyof UserPayload | undefined,
    ctx: ExecutionContext,
  ): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    // 如果指定了 data（如 @User('email')），返回该属性
    if (data && user) {
      return user[data];
    }

    // 否则返回整个 user 对象
    return user;
  },
);
