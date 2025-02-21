import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field()
  cuid: string;

  @Field()
  email: string;

  @Field()
  username: string;
}
