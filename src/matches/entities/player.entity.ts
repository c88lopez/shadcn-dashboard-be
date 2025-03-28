import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field({ description: 'Unique identifier of the player' })
  cuid: string;

  @Field({ description: "Player's first name" })
  firstName: string;

  @Field({ description: "Player's last name" })
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
