import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus } from '@nestjs/common';

const corsWhitelist = [
  'http://localhost:3030',
  'http://192.168.1.2:3000',
  'https://terrenos.sibradgo.com.mx',
  'https://xn--campiadelaguila-2qb.com',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    origin: function (origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (
        corsWhitelist.includes(origin) || // Checks your whitelist
        !!origin.match(/api.certx-mx\.org$/) // Overall check for your domain
      ) {
        callback(null, true);
      } else {
        callback(
          new HttpException('Not allowed by CORS', HttpStatus.I_AM_A_TEAPOT),
          false,
        );
      }
    },
  });
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
