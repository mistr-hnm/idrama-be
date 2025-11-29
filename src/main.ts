import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload'
import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context, Handler } from "aws-lambda";

let server: Handler;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(graphqlUploadExpress())
  // with server
  // await app.listen(process.env.PORT ?? 3000);

  // For serverless
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
