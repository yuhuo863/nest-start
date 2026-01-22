import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name); // 可选：设置过滤器上下文
  }
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

    // 3. 日志记录(错误堆栈、请求信息等存入数据库）
    this.logger.error(
      `${request.method} ${request.url} - ${message}`, // 主消息
      {
        statusCode: status,
        method: request.method,
        path: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        stack: exception instanceof Error ? exception.stack : null,
        exception: exception instanceof Error ? exception.name : null,
        errors,
      } as any,
    );

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
