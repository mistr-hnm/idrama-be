import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo' 
import { GraphQLError, GraphQLFormattedError } from 'graphql' 
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './modules/media/media.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import typeOrmConfig from './config/typeorm.config'; 
import { isArray } from 'class-validator'
import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageLocalDefault,
} from '@apollo/server/plugin/landingPage/default'
import { GraphQLUpload } from 'graphql-upload';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    MediaModule,
    UserModule,
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => ({
        playground: false,
        uploads: false,
        resolvers: { Upload: GraphQLUpload },
        plugins: [
          process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageProductionDefault({
                graphRef: 'nature-connect@app',
                footer: false,
              })
            : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
        ],
        path : '/graphql',
        autoSchemaFile: true,
        formatError: (error: GraphQLError) => {
          const formattedError: GraphQLFormattedError = {
            message: isArray(error.extensions?.response?.['message'])
              ? error.extensions?.response?.['message'][0]
              : error.extensions?.response?.['message'] ||
                error.extensions?.response ||
                error.message ||
                error.extensions?.response?.['message'] ||
                error.extensions?.exception?.['response']?.message ||
                error.extensions?.exception?.['message']?.message ||
                error.extensions?.exception?.['response'] ||
                error.extensions?.exception?.['message'] ||
                error?.extensions ||
                error,
          }
          return formattedError
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
