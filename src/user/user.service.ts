import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { USER_REPOSITORY } from '../constants';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { UserPayload, UserRO } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 查询所有用户
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'bio', 'avatar'], // 隐藏密码
    });
  }

  // 根据ID查询用户
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'bio', 'avatar'],
    });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  // 内部方法：根据条件查询用户（含密码，供登录用）
  private async findOneWithPassword(
    condition: FindOptionsWhere<User>,
  ): Promise<User | null> {
    return this.userRepository.findOne({ where: condition });
  }

  // 注册用户
  async register(createUserDto: CreateUserDto): Promise<UserRO> {
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
      bio: '', // 覆盖默认值
      avatar: '',
    });
    await this.userRepository.save(user);

    // 3. 生成JWT令牌
    const token = await this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // 4. 返回用户信息（隐藏密码）
    return {
      user: {
        username: user.username,
        email: user.email,
        token,
        bio: user.bio,
        avatar: user.avatar,
      },
    };
  }

  // 登录用户
  async login(loginUserDto: LoginUserDto): Promise<UserRO> {
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
    const token = await this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // 4. 返回用户信息
    return {
      user: {
        username: user.username,
        email: user.email,
        token,
        bio: user.bio,
        avatar: user.avatar,
      },
    };
  }

  // 更新用户
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserRO> {
    // 1. 校验用户是否存在
    const user = await this.findOneWithPassword({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    // 2. 若更新邮箱，校验新邮箱是否已被占用（排除自身）
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneWithPassword({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new BadRequestException(`邮箱 ${updateUserDto.email} 已被注册`);
      }
    }

    // 3. 更新用户信息
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // 4. 重新生成令牌（若更新了核心信息）
    const token = await this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // 5. 返回更新后信息
    return {
      user: {
        username: user.username,
        email: user.email,
        token,
        bio: user.bio,
        avatar: user.avatar,
      },
    };
  }

  // 删除用户
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOneWithPassword({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    await this.userRepository.remove(user);
    return { message: `用户ID ${id} 已成功删除` };
  }

  // 生成JWT令牌（封装成私有方法）
  private async generateToken(payload: UserPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d', // 令牌有效期7天
      secret: process.env.JWT_SECRET || 'your-strong-secret-key',
    });
  }
}
