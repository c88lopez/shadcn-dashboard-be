import { Catch, ExceptionFilter } from '@nestjs/common';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';

@Catch(GraphQLException)
export class GraphqlExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: any) {
    // We just catch and throw to avoid NestJS from logging the exception.
    throw exception;
  }
}
