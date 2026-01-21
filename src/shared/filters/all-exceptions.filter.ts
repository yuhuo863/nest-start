import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. 提取状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. 提取错误详情
    let message = 'Internal Server Error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      // 适配官方 ValidationPipe 的 message 数组或自定义对象的 errors 字段
      message = Array.isArray(res.message)
        ? '参数校验失败'
        : res.message || exception.message;
      errors = Array.isArray(res.message) ? res.message : res.errors || null;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 3. 构建元数据并记录日志（由 Winston 分发至 Console 和数据库）
    // const logEntityData = {
    //   level: 'error', // 对应 LogEntity.level，当前场景是异常，固定为 error
    //   message: message, // 对应 LogEntity.message，异常核心描述
    //   meta: {
    //     // 对应 LogEntity.meta（JSON 类型），打包所有上下文信息
    //     statusCode: status,
    //     path: request.url,
    //     method: request.method,
    //     stack: exception instanceof Error ? exception.stack : null,
    //   },
    // };

    // 仅在 500 以上错误或校验失败时记录
    // if (status >= 400) {
    //   this.logger.error(
    //     `Exception at ${request.method} ${request.url}`,
    //     logEntityData,
    //   );
    // }

    // 4. 返回统一 JSON 格式
    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
