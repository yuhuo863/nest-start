import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

/**
 * 创建用户的DTO（数据传输对象）
 * 用于验证客户端提交的创建用户数据
 */
export class CreateUserDto {
  /**
   * 用户名
   * 非空 + 长度6-20位（避免过短/过长）
   */
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(6, 20, { message: '用户名长度必须在6-20位之间' })
  readonly username: string;

  /**
   * 邮箱
   * 非空 + 合法邮箱格式 + 自定义错误提示
   */
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  readonly email: string;

  /**
   * 密码
   * 非空 + 强度校验（至少8位，包含大小写字母、数字、特殊字符）
   */
  @IsNotEmpty({ message: '密码不能为空' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: '密码至少8位且包含大小写字母、数字和特殊字符（@$!%*?&）',
    },
  )
  readonly password: string;

  @IsString({ message: '简介必须是字符串类型' })
  readonly bio?: string;

  @IsString({ message: '头像地址必须是字符串类型' })
  @IsUrl({}, { message: '头像地址必须是合法的URL' })
  readonly avatar?: string;
  /**
   * deleted_at 是后端自动维护的软删除字段，禁止前端直接传入 / 修改，因此绝大多数场景下 DTO 中不需要定义该字段
   */
}
