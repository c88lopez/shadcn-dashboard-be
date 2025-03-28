import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePlayerInput {
  @Field(() => String, { description: "Player's first name", nullable: false })
  firstName: string;

  @Field(() => String, { description: "Player's last name", nullable: false })
  lastName: string;

  @Field({
    description: "Player's Date of Birth, UTC timestamp",
    nullable: true,
  })
  dateOfBirth?: number;

  @Field({ description: "Player's phone number", nullable: true })
  phoneNumber?: string;

  @Field({ description: "Player's email", nullable: true })
  email?: string;

  @Field({ description: 'Player Instagram account', nullable: true })
  instagram?: string;
}
