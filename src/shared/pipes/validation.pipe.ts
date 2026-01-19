import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 非类类型（如string/number）无需校验
    if (!metatype || !this.isClass(metatype)) {
      return value;
    }

    // 将普通对象转为类实例（触发class-validator装饰器）
    const object = plainToInstance(metatype, value);
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

    return value;
  }

  // 判断是否为类（排除基础类型）
  private isClass(metatype: Function): boolean {
    // ⬇️ 修复：显式指定类型为 Function[]
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
