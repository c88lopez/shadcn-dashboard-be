import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql/error';
import { APP_FILTER } from '@nestjs/core';
import { GraphqlExceptionFilter } from './graphql-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env.local',
      expandVariables: true,
    }),
    UsersModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      formatError: (error: GraphQLError): GraphQLFormattedError => ({
        message: error.message,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GraphqlExceptionFilter },
  ],
})
export class AppModule {}
