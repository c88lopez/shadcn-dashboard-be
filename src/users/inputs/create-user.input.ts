import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: "User's email", nullable: false })
  email: string;

  @Field(() => String, { description: "User's username", nullable: false })
  username: string;

  @Field(() => String, { description: "User's password", nullable: false })
  password: string;

  @Field(() => [String], {
    description: 'List of groups to assign',
    nullable: true,
  })
  groups?: string[];
}
