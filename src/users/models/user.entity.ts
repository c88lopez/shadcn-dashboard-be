import { Field, ObjectType } from '@nestjs/graphql';
import { Team } from '../../teams/entities/team.entity';

@ObjectType({ description: 'user' })
export class User {
  @Field({ description: 'Unique identifier of the user' })
  cuid: string;

  @Field({ description: "User's email" })
  email: string;

  @Field({ description: 'Public user name of the user' })
  username: string;

  @Field(() => [Team], { nullable: true })
  teams?: Team[];

  password: string;
}
