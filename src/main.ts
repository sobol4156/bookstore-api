import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const appOptions: NestApplicationOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.enableCors({
    credentials: true
  })
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }
  ));

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Bookstore API')
    .setDescription('API for managing a bookstore. Allows managing books, authors, categories, orders, and rentals.')
    .setVersion('1.0')
    .addTag('auth', 'Authentication and authorization')
    .addTag('books', 'Book operations')
    .addTag('authors', 'Author operations')
    .addTag('health', 'Application health check')
    .addCookieAuth('access_token', {
      type: 'http',
      in: 'Cookie',
      scheme: 'Bearer',
      description: 'JWT token in cookie',
    })
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token in Authorization header',
    })
    .build();

    const document = SwaggerModule.createDocument(app, options, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
    });
    
    SwaggerModule.setup('/docs', app, document, {
      jsonDocumentUrl: '/docs-json',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
