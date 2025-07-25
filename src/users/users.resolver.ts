import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Prisma } from '@prisma/client';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';
import { UpdateUserInput } from './inputs/update-user.input';
import { CreateUserInput } from './inputs/create-user.input';
import { UserGroupsService } from './user-groups.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { UserCreateSchema, UserUpdateSchema } from '@vandelay-labs/schemas';

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  async findAll(@Context() context: any) {
    // Example on how to get the user payload from the jwt in a request.
    this.logger.debug('findAll', context.req.user);

    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('cuid', { type: () => String }) cuid: string) {
    this.logger.debug('findOne');

    try {
      // We need to await here in order to catch any error
      return await this.usersService.findOne(cuid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new GraphQLException('User not found', {
            extensions: { http: { status: HttpStatus.NOT_FOUND } },
          });
        }
      }
    }
  }

  @ResolveField()
  async groups(@Parent() user: User) {
    return this.userGroupsService.findAllByUser(user.id);
  }

  @Mutation(() => User)
  async createUser(
    @Args(
      { name: 'createUserData', type: () => CreateUserInput },
      new ZodValidationPipe(UserCreateSchema as any),
    )
    createUserData: CreateUserInput,
  ) {
    this.logger.debug('createUser', { createUserData });

    return await this.usersService.create(createUserData);
  }

  @Mutation(() => User)
  async updateUser(
    @Args({ name: 'cuid', type: () => String }) cuid: string,
    @Args(
      { name: 'updateUserData', type: () => UpdateUserInput },
      new ZodValidationPipe(UserUpdateSchema as any),
    )
    updateUserData: UpdateUserInput,
  ) {
    this.logger.debug('updateUser', { cuid, updateUserData });

    if (updateUserData.password) {
      updateUserData.password = await bcrypt.hash(updateUserData.password, 10);
    } else {
      delete updateUserData.password;
    }

    return this.usersService.update(cuid, updateUserData);
  }

  @Mutation(() => User)
  async removeUser(@Args({ name: 'cuid', type: () => String }) cuid: string) {
    this.logger.debug('removeUser', { cuid });

    let userToDelete: User | undefined;

    try {
      userToDelete = await this.usersService.findOne(cuid);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.usersService.remove(userToDelete.id);

    return userToDelete;
  }
}
