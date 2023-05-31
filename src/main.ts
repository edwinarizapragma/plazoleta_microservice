import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../util/http-exception.fillter';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  // definition of documentation library
  const options = new DocumentBuilder()
    .setTitle('API de plazoleta')
    .setDescription('Documentación para api de plazoleta')
    .setVersion('1.0')
    // .addTag('usuarios')
    // .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.APP_PORT || 3000;
  console.log(`listening on ${port}`);
  await app.listen(3000);
}
bootstrap();
