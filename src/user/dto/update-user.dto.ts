import { IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class UpdateUserDto {
  // 用户名：可选 + 字符串校验
  @IsOptional() // 标记为可选字段（更新时可不传）
  @IsString({ message: '用户名必须是字符串类型' })
  readonly username?: string;

  // 邮箱：可选 + 邮箱格式校验
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email?: string;

  // 个人简介：可选 + 字符串校验
  @IsOptional()
  @IsString({ message: '个人简介必须是字符串类型' })
  readonly bio?: string;

  // 头像：可选 + 字符串（可选加URL格式校验）
  @IsOptional()
  @IsString({ message: '头像地址必须是字符串类型' })
  // 如果需要校验头像是合法URL，可追加下面这行：
  @IsUrl({}, { message: '头像地址必须是合法的URL' })
  readonly avatar?: string;
}
