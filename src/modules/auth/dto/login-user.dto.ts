import { IsEmail, IsNotEmpty, Length } from 'class-validator';

/**
 * 用户登录的DTO（数据传输对象）
 * 用于验证客户端提交的登录数据
 */
export class LoginUserDto {
  /**
   * 登录邮箱
   * 非空 + 合法邮箱格式 + 自定义错误提示
   */
  @IsNotEmpty({ message: '登录邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的登录邮箱' })
  readonly email: string;

  /**
   * 登录密码
   * 非空 + 基础长度校验（与创建用户的密码最小长度一致）
   */
  @IsNotEmpty({ message: '登录密码不能为空' })
  @Length(8, undefined, { message: '密码长度不能少于8位' })
  readonly password: string;
}
