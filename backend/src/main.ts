import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // ✅ AGREGADO: ValidationPipe global con transformers habilitados
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Ignora propiedades no definidas
      forbidNonWhitelisted: false, // Pero NO tira error, solo las ignora
      transform: true,           // ✅ IMPORTANTE: Aplica los transformers del DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Habilitando CORS para que el frontend pueda comunicarse
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en http://localhost:3000`);
}
bootstrap();
