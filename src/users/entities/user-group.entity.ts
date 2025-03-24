import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class UserGroup {
  @Field({ description: 'ID of the group' })
  cuid: string;

  @Field({ description: 'Name of the group' })
  name: string;

  @Field(() => [User], {
    nullable: true,
    description: 'List of users in the group',
  })
  users?: User[];
}
