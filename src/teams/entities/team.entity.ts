import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.entity';

@ObjectType()
export class Team {
  @Field({ description: 'ID of the team' })
  cuid: string;

  @Field({ description: 'Name of the team' })
  name: string;

  @Field(() => [User], {
    nullable: true,
    description: 'List of users in the team',
  })
  users?: User[];
}
