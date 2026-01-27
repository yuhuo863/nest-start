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

@Catch(HttpException) // 捕获所有 HttpException
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(HttpExceptionsFilter.name);
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. 提取状态码 (HttpException 自带，其他情况默认为500)
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. 提取错误详情
    let message: string;
    let errors: any;

    const res = exception.getResponse() as any;
    // 第一步：处理 getResponse() 返回值为字符串的场景（直接抛文本的情况）
    if (typeof res === 'string') {
      message = res;
      errors = null;
    } else {
      // 第二步：适配 ValidationPipe 的 message 数组场景
      if (Array.isArray(res.message)) {
        message = '参数校验失败';
        errors = res.message;
      } else {
        // 第三步：自定义对象的 message/errors 场景
        message = res.message || exception.message;
        errors = res.errors || null;
      }
    }

    // 兜底：如果最终 message 仍为空，使用 exception.message
    message = message || exception.message;

    // 3. 日志记录(错误堆栈、请求信息等存入数据库）
    this.logger.error(
      `${request.method} ${request.url} - ${message}`, // 主消息
      {
        statusCode: status,
        method: request.method,
        path: request.url,
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
