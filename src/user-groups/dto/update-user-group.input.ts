import { CreateUserGroupInput } from './create-user-group.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserGroupInput extends PartialType(CreateUserGroupInput) {
  @Field(() => String)
  cuid: string;
}
