import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UserUpdateInput } from './inputs/updateUser.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  findAll() {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  update(
    @Args({ name: 'cuid', type: () => String }) cuid: string,
    @Args({ name: 'updateUserData', type: () => UserUpdateInput })
    updateUserData: UserUpdateInput,
  ) {
    return this.usersService.update(cuid, updateUserData);
  }
}
