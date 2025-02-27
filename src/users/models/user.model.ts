import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field()
  cuid: string;

  @Field()
  email: string;

  @Field()
  username: string;

  password: string;
}
