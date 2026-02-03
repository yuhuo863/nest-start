import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from './dto';
import { UserData, UserPayload } from '../user/interfaces/user.interface';
import type { AuthModuleOptions } from './auth-module-options.interface';
import { MODULE_OPTIONS_TOKEN } from './auth.module-definition';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) // 注入User的Repository服务（modules中提供程序中对应的provide值）
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,

    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleOptions,
  ) {
    const filePath = `.env.${process.env.NODE_ENV || 'development'}`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);

    console.debug(
      '旨在演示如何通过 ConfigurableModuleBuilder 简化手动创建高度可配置、动态的模块并暴露异步方法的过程。',
    );
    console.log(`[动态加载]环境变量文件【示例】：${envFile}`);
  }

  private async findOneWithPassword(
    condition: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: condition });
  }
  // 注册用户
  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: UserData }> {
    // 1. 校验邮箱是否已存在
    const existingUser = await this.findOneWithPassword({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException(`邮箱 ${createUserDto.email} 已被注册`);
    }

    // 2. 创建用户（密码通过实体的BeforeInsert自动哈希）
    const user = this.userRepository.create({
      ...createUserDto,
      bio: '',
      avatar: '',
      deleted_at: null,
    });
    await this.userRepository.save(user); // 保存用户信息到数据库（自动触发BeforeInsert钩子）

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return {
      message: '注册成功',
      user: result,
    };
  }

  // 登录用户
  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    // 1. 查询用户（含密码）
    const user = await this.findOneWithPassword({ email: loginUserDto.email });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 2. 校验密码（调用实体的verifyPassword方法）
    const isPasswordValid = await user.verifyPassword(loginUserDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 3. 生成令牌
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // 4. 返回用户信息
    return {
      token,
    };
  }

  private generateToken(payload: UserPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '7d', // 令牌有效期7天
      secret: process.env.JWT_SECRET || 'your-strong-secret-key',
    });
  }
}
