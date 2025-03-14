import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  password: string;

  @Field(() => [String], {
    description: 'List of teams to assign',
    nullable: true,
  })
  teams?: string[];
}
