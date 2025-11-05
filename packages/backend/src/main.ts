import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- Swagger API Documentation Setup ---
  const config = new DocumentBuilder()
    .setTitle('Payer Restaurant SaaS API')
    .setDescription('The API documentation for the Payer Restaurant SaaS application.')
    .setVersion('1.0')
    .addTag('orders', 'Endpoints for managing orders')
    .addTag('merchants', 'Endpoints for managing merchants and menus')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI will be available at /api

  // --- WebSocket Redis Adapter ---
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // --- Global Pipes ---
  app.useGlobalPipes(new ValidationPipe()); // Enable validation for all incoming requests

  // --- Static Assets ---
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // --- CORS ---
  app.enableCors();

  // --- Start Application ---
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger API documentation is available at: http://localhost:3000/api`);
}
bootstrap();
