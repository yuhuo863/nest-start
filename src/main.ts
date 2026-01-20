import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { ValidationPipe } from './shared/pipes/validation.pipe';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import * as crypto from 'crypto';

async function bootstrap() {
  // 生成JWT密钥
  // const jwtSecret = crypto.randomBytes(32).toString('hex');
  // console.log(jwtSecret);

  const app = await NestFactory.create(AppModule, {
    cors: true, // 开启跨域
    abortOnError: false, // 异常时不终止进程, 直接抛出错误
  });

  // app.set('query parser', 'extended'); // Express 解析复杂查询字符串(可选)

  app.setGlobalPrefix('api'); // 全局接口前缀

  // 1. 注册全局异常过滤器（统一返回格式）
  app.useGlobalFilters(new AllExceptionsFilter());

  // 2. 注册全局校验管道（统一参数校验）
  app.useGlobalPipes(new ValidationPipe());

  // 3. 配置Swagger文档
  const config = new DocumentBuilder()
    .setTitle('NestJS 用户管理API')
    .setDescription('基于NestJS + TypeORM的用户管理系统')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth() // 支持Bearer令牌认证
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`应用运行在: http://localhost:3000/api/docs`);
}
bootstrap();
