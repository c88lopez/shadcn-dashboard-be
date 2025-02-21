import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env?.ENVIRONMENT !== 'local',
    }),
    cors: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
