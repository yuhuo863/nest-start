import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Put,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { UserRO } from './interfaces/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 查询所有用户（需认证）
  @Get()
  @UseGuards(AuthGuard) // 使用认证守卫
  async findAll() {
    return this.userService.findAll();
  }

  // 根据ID查询用户（需认证）
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  // 注册用户（无需认证）
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<string> {
    return this.userService.register(createUserDto);
  }

  // 登录用户（无需认证）
  @Post('login')
  @HttpCode(200) // 自定义状态码, POST请求默认201，此处改为200
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ token: string }> {
    return this.userService.login(loginUserDto);
  }

  // 更新用户（需认证）
  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRO> {
    return this.userService.update(id, updateUserDto);
  }

  // 软删除用户（需认证）
  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // 恢复软删除用户(需认证）
  @Post(':id/restore')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.recover(id);
  }

  // 强制删除用户(需认证）
  @Delete(':id/force')
  @UseGuards(AuthGuard)
  async forceRemove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.forceRemove(id);
  }
}
