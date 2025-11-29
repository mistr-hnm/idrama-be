// src/lambda.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, Context } from 'aws-lambda';
import express from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    console.log('🚀 Cold start - Initializing NestJS...');
    
    const expressApp = express();
    
    try {
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { 
          logger: ['error', 'warn', 'log'],
          abortOnError: false 
        }
      );

      // Enable CORS
      app.enableCors();


      // with server
      // await app.listen(process.env.PORT ?? 3000);
      
      // Initialize the app
      await app.init();
      
      console.log('✅ NestJS initialized successfully');
      
      // Create serverless express handler
      cachedServer = serverlessExpress({ 
        app: expressApp,
        logSettings: {
          level: 'info'
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize NestJS:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  console.log('📨 Lambda invoked');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const server = await bootstrap();
    const result = await server(event, context);
    console.log('✅ Request processed successfully');
    return result;
  } catch (error) {
    console.error('❌ Lambda handler error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return a proper error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};