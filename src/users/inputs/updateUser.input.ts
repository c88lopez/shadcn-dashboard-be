import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  name: string;
}
