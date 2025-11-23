import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload'
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context, Handler } from "aws-lambda";

let server: Handler;
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // // Cors config
  // app.enableCors()
  // app.use(graphqlUploadExpress())
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     exceptionFactory: (errors: ValidationError[]) => {
  //       const errorMessage = errors.map(error =>
  //         Object.values(error.constraints).join(', ')
  //       )

  //       const errorMessageParse = errorMessage
  //         .map(error => error.charAt(0).toUpperCase() + error.slice(1))
  //         .join(', ')

  //       return new BadRequestException(String(errorMessageParse))
  //     },
  //     forbidUnknownValues: false,
  //   })
  // )
  // await app.listen(process.env.PORT ?? 3000);

  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });

}
// bootstrap();

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
