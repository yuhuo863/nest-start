import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// 统一返回格式的接口
interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: any;
  timestamp: string;
  path: string;
}

// 捕获所有异常（包括内置和自定义）
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. 确定HTTP状态码
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. 构建错误信息
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : '服务器内部错误';

    // 3. 提取详细错误（如校验错误）
    let errors: any = null;
    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === 'object' &&
      (exception.getResponse() as any).errors
    ) {
      errors = (exception.getResponse() as any).errors;
    }

    // 4. 统一返回格式
    const errorResponse: ApiErrorResponse = {
      statusCode,
      message: Array.isArray(message) ? message[0] : message, // 兼容数组型错误信息
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 5. 设置响应头并返回JSON
    response.status(statusCode).json(errorResponse);
  }
}
