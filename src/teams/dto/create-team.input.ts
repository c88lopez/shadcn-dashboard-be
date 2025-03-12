import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTeamInput {
  @Field(() => String, { description: 'Name of the new team' })
  name: string;

  @Field(() => [String], {
    description: 'List of users to assign',
    nullable: true,
  })
  users?: string[];
}
