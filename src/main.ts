import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // 1. 创建应用实例
    // 注意：如果数据库配置错误，Nest 会在这里抛出异常
    const app = await NestFactory.create(AppModule, {
      cors: true,
      abortOnError: true, // 建议设为 true，确保数据库连接失败时直接拦截
    });

    // 2. 此时数据库连接其实已经由 TypeOrmModule 完成了
    // 我们只需要检查连接状态确认是否真正成功
    const dataSource = app.get(DataSource);

    if (dataSource.isInitialized) {
      logger.log('🚀 Database connection established successfully.');
    } else {
      // 如果因为某些原因未初始化，手动尝试一次
      await dataSource.initialize();
    }

    // 3. 配置其他中间件和 Swagger
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Users example')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // 4. 最后启动 HTTP 端口
    await app.listen(process.env.PORT || 3000);
    logger.log(`应用接口文档运行在: http://localhost:3000/api/docs`);
  } catch (error) {
    // 捕获整个启动过程中的异常（包括数据库连接失败）
    logger.error('❌ Application failed to start!');
    logger.error(error);
    process.exit(1);
  }
}
bootstrap();
