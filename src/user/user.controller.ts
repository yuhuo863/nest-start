import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UsePipes,
  UseGuards,
  ParseIntPipe,
  Put,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { AuthGuard } from './guards/auth.guard';
import { UserRO } from './user.interface';

@ApiTags('users')
@Controller('users')
@UsePipes(new ValidationPipe()) // 应用参数校验管道
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 查询所有用户（需认证）
  @Get()
  @ApiOperation({ summary: '查询所有用户' })
  @ApiBearerAuth() // Swagger标记需要Bearer令牌
  @UseGuards(AuthGuard) // 使用认证守卫
  async findAll() {
    return this.userService.findAll();
  }

  // 根据ID查询用户（需认证）
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询用户' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  // 注册用户（无需认证）
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserRO> {
    return this.userService.register(createUserDto);
  }

  // 登录用户（无需认证）
  @Post('login')
  @HttpCode(200) // 自定义状态码, POST请求默认201，此处改为200
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<UserRO> {
    return this.userService.login(loginUserDto);
  }

  // 更新用户（需认证）
  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRO> {
    return this.userService.update(id, updateUserDto);
  }

  // 软删除用户（需认证）
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // 恢复软删除用户(需认证）
  @Post(':id/restore')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.recover(id);
  }

  // 强制删除用户(需认证）
  @Delete(':id/force')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async forceRemove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.forceRemove(id);
  }
}
