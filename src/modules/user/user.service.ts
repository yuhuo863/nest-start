import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  // Logger,
} from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto';
import { UserRO } from './interfaces/user.interface';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) // 注入UserRepository服务
    private readonly userRepository: Repository<UserEntity>,

    @Inject(WINSTON_MODULE_NEST_PROVIDER) // 注入Logger服务
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(UserService.name); // 设置Logger的上下文(context)，便于区分日志来源
  }

  // private readonly logger = new Logger(UserService.name, { timestamp: true });

  // 查询所有用户
  async findAll(): Promise<UserEntity[]> {
    // this.logger.warn('findAll() is called!', UserService.name);
    return this.userRepository.find();
  }

  // 根据ID查询用户
  async findOneById(id: number): Promise<UserEntity> {
    // 延时5秒，模拟网络延迟
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    console.log('Method of UserEntity Exposed!', user._someField);
    return user;
  }

  // 内部方法：根据条件查询用户（含密码，供登录用）
  private async findOneWithPassword(
    condition: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: condition });
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

    // 5. 返回更新后信息
    return {
      user: {
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    };
  }

  // 删除用户(软删除）
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOneWithPassword({ id });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    await this.userRepository.softRemove(user); // 软删除（自动设置 deleted_at 为当前时间）
    return { message: `用户ID ${id} 已成功删除` };
  }

  // 恢复软删除
  async recover(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true, // 包含已删除的记录
    });
    if (!user) throw new NotFoundException(`用户ID ${id} 不存在`);
    await this.userRepository.recover(user); // 恢复（deletedAt 设为 null）
    return { message: `用户ID ${id} 已恢复` };
  }

  // 强制删除
  async forceRemove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`用户ID ${id} 不存在`);
    await this.userRepository.remove(user); // 强制删除（物理删除）
    return { message: `用户ID ${id} 已彻底删除` };
  }
}
