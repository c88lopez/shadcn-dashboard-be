import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UserCreateInput } from './inputs/createUser.input';
import { UserUpdateInput } from './inputs/updateUser.input';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async Users() {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  createUser(
    @Args({ name: 'createUserData', type: () => UserCreateInput })
    createUserData: UserCreateInput,
  ) {
    return this.usersService.create(createUserData);
  }

  @Mutation(() => User)
  updateUser(
    @Args({ name: 'cuid', type: () => String }) cuid: string,
    @Args({ name: 'updateUserData', type: () => UserUpdateInput })
    updateUserData: UserUpdateInput,
  ) {
    return this.usersService.update(cuid, updateUserData);
  }

  @Mutation(() => User)
  async deleteUser(@Args({ name: 'cuid', type: () => String }) cuid: string) {
    let userToDelete = {};

    try {
      userToDelete = await this.usersService.findOne(cuid);
    } catch (error) {
      throw new GraphQLException('User not found', {
        extensions: { http: { status: HttpStatus.NOT_FOUND } },
      });
    }

    await this.usersService.remove(cuid);

    return userToDelete;
  }
}
