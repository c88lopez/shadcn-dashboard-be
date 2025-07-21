import { GraphQLError } from "graphql";

export class GqlUserException extends GraphQLError {
  constructor(message: string) {
    super(message);
  }
}
