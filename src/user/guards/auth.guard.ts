import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserPayload } from '../user.interface';

// 扩展Express Request类型，挂载用户信息
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 获取请求对象
    const request = context.switchToHttp().getRequest<Request>();

    // 2. 提取token（从Authorization头）
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('未提供有效的认证令牌（Bearer Token）');
    }

    try {
      // 3. 验证并解析token
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: process.env.JWT_SECRET || 'your-strong-secret-key', // 生产环境用环境变量
      });

      // 4. 将用户信息挂载到request，供控制器/服务使用
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException(
        error.name === 'TokenExpiredError'
          ? '认证令牌已过期'
          : '无效的认证令牌',
      );
    }

    return true;
  }

  // 从请求头提取token（处理Bearer前缀）
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
