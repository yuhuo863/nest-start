import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '../../auth/dto';

export class UpdateUserDto extends PartialType(
  // PartialType 将一个类型的所有属性变为“可选”（加上 ?）
  // OmitType 排除某些属性，此处排除 password
  OmitType(CreateUserDto, ['password'] as const), // 更新用户信息时，不允许用户通过该接口修改 password
) {}
