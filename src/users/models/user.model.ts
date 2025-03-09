import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field()
  cuid: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => [Team], { nullable: true })
  teams?: Team[];

  password: string;
}

@ObjectType({ description: 'team' })
export class Team {
  @Field()
  name: string;

  @Field(() => [User], { nullable: true })
  users?: User[]; // Test comment 2
}
