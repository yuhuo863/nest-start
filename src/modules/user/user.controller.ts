import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  HttpCode,
  ParseIntPipe,
  HttpStatus,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { User } from '../../shared/decorators/user.decorator';
import type { UserPayload } from './interfaces/user.interface';
import { TimeoutInterceptor } from '../../shared/interceptors/timeout.interceptor';
import { Auth } from '../../shared/decorators/auth.decorator';

@Controller('users')
@Auth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 查询所有用户（需认证）
  @Get()
  findAll(
    @User(new ValidationPipe({ validateCustomDecorators: true })) // 将管道应用于自定义参数装饰器
    user: UserPayload,
  ) {
    console.log('current valid user: ', user);
  }

  // 根据ID查询用户（需认证）
  @Get(':id')
  @UseInterceptors(TimeoutInterceptor) // 自定义拦截器，设置超时时间
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  // 更新用户（需认证）
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // 软删除用户（需认证）
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // 恢复软删除用户(需认证）
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.recover(id);
  }

  // 强制删除用户(需认证）
  @Delete(':id/force')
  async forceRemove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.forceRemove(id);
  }
}
