import { Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";
import { GqlUserException } from "./common/exceptions/gql-user.exception";

@Catch(GqlUserException)
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name);

  catch(exception: GqlUserException, host: ArgumentsHost) {
    this.logger.error(exception);
    // We just catch and throw to avoid NestJS from logging the exception.
    throw exception;
  }
}
