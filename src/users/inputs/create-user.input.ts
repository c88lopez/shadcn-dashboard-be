import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: "User's email", nullable: true })
  email: string;

  @Field(() => String, { description: "User's username", nullable: true })
  username: string;

  @Field(() => String, { description: "User's password", nullable: true })
  password: string;

  @Field(() => [String], {
    description: 'List of groups to assign',
    nullable: true,
  })
  groups?: string[];
}
