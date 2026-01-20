import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 非类类型（如string/number）无需校验
    if (!metatype || !this.isClass(metatype)) {
      return value;
    }

    // 1. 转换为DTO实例
    const object = plainToInstance(metatype, value);
    // 2. 校验
    const errors = await validate(object);

    // 校验失败则抛出结构化异常（供全局过滤器处理）
    if (errors.length > 0) {
      const errorMessages = errors.reduce((acc, err) => {
        acc[err.property] = Object.values(err.constraints || {});
        return acc;
      }, {});

      throw new BadRequestException({
        message: '参数校验失败',
        errors: errorMessages,
      });
    }

    // 3. 过滤多余字段（仅保留DTO中定义的字段）
    return instanceToPlain(object);
  }

  // 判断是否为类（排除基础类型）
  private isClass(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
