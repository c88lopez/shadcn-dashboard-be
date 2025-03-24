import { Field, ObjectType } from '@nestjs/graphql';
import { UserGroup } from './user-group.entity';

@ObjectType({ description: 'user' })
export class User {
  id: number;

  @Field({ description: 'Unique identifier of the user' })
  cuid: string;

  @Field({ description: "User's email" })
  email: string;

  @Field({ description: 'Public user name of the user' })
  username: string;

  @Field(() => [UserGroup], { nullable: true })
  groups?: UserGroup[];

  password: string;
}
