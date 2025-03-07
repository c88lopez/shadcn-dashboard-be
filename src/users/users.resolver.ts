import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import * as bcrypt from 'bcrypt';

import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UserCreateInput } from './inputs/createUser.input';
import { UserUpdateInput } from './inputs/updateUser.input';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';

import { UserCreateSchema, UserUpdateSchema } from 'schemas';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async Users() {
    this.logger.debug('Resolving findAll users');

    return this.usersService.findAll();
  }

  @Mutation(() => User)
  createUser(
    @Args({ name: 'createUserData', type: () => UserCreateInput })
    createUserData: UserCreateInput,
  ) {
    this.logger.debug('Resolving create user');

    const validation = UserCreateSchema.safeParse(createUserData);

    if (!validation.success) {
      throw new HttpException(
        validation.error.issues[0].message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.create(createUserData);
  }

  @Mutation(() => User)
  async updateUser(
    @Args({ name: 'cuid', type: () => String }) cuid: string,
    @Args({ name: 'updateUserData', type: () => UserUpdateInput })
    updateUserData: UserUpdateInput,
  ) {
    this.logger.debug('Resolving update users');

    const validation = UserUpdateSchema.safeParse(updateUserData);

    if (!validation.success) {
      throw new HttpException(
        validation.error.issues[0].message,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateUserData.password) {
      updateUserData.password = await bcrypt.hash(updateUserData.password, 10);
    } else {
      delete updateUserData.password;
    }

    return this.usersService.update(cuid, updateUserData);
  }

  @Mutation(() => User)
  async deleteUser(@Args({ name: 'cuid', type: () => String }) cuid: string) {
    this.logger.debug('Resolving delete user');

    let userToDelete = {};

    try {
      userToDelete = await this.usersService.findOne(cuid);
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.remove(cuid);

    return userToDelete;
  }
}
