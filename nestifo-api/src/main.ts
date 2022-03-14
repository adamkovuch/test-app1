import { NestApplication, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { NgUniversalFilter } from './app.filter';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';

const expressApp = express();

const logger = new Logger(NestApplication.name)

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nestifo')
    .setDescription('Nestifo API')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

function initApp(app: INestApplication) {
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new NgUniversalFilter());
}

async function bootstrap() {
  const expressAdapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, expressAdapter);
  initApp(app);
  initSwagger(app);
  await app.init();
}

bootstrap().then(() => {
  const port = process.env.PORT || 3000;
  expressApp.listen(port, () => {
    logger.log(`Server started on ${port} port`);
  });
});

