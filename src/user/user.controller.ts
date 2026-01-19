import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findAll() {
    return this.userService.findAll();
  }

  // 根据ID查询用户（需认证）
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询用户' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  // 注册用户（无需认证）
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '参数错误/邮箱已注册' })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserRO> {
    return this.userService.register(createUserDto);
  }

  // 登录用户（无需认证）
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<UserRO> {
    return this.userService.login(loginUserDto);
  }

  // 更新用户（需认证）
  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRO> {
    return this.userService.update(id, updateUserDto);
  }

  // 删除用户（需认证）
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
