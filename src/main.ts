import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/exceptions/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('NestServer');

  // 1. Global Pipes Validation (Tự động validate DTO công thức Type-safe)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 2. Setup Cấu hình Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('NestJS Base Source API')
    .setDescription('Hệ thống tài liệu API mẫu chuẩn chỉnh - Tái sử dụng cho mọi dự án')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.debug(`🚀 Server running on port: ${port}`);
  logger.debug(`📝 Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
