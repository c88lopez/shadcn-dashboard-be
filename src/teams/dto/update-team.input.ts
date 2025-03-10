import { CreateTeamInput } from './create-team.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTeamInput extends PartialType(CreateTeamInput) {
  @Field(() => String)
  cuid: string;
}
