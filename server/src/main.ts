import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Mark Anthony Realty — HRMS & ERP API')
    .setDescription(
      'Modular HRMS & ERP REST API covering Auth & Impersonation, Employee Directory, Dual Attendance, Leave, ATS Recruitment, Onboarding LMS, Offboarding NOC, Performance, Payroll, and Assets.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token (supports SuperAdmin impersonation tokens)',
      },
      'JWT-auth',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
