import { CreateUserGroupInput } from './create-user-group.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserGroupInput extends PartialType(CreateUserGroupInput) {}
