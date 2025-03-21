import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupInput } from './dto/create-user-group.input';
import { Prisma } from '@prisma/client';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';
import { HttpStatus, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserGroup } from './entities/user-group.entity';
import { UpdateUserGroupInput } from './dto/update-user-group.input';

@Resolver(() => UserGroup)
export class UserGroupsResolver {
  private readonly logger = new Logger(UserGroupsResolver.name);

  constructor(
    private readonly teamsService: UserGroupsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => [UserGroup], { name: 'userGroups' })
  findAll() {
    this.logger.debug('findAll');

    return this.teamsService.findAll();
  }

  @Query(() => UserGroup, { name: 'userGroup' })
  async findOne(@Args('cuid', { type: () => String }) cuid: string) {
    this.logger.debug('findOne', { cuid });

    try {
      // We need to await here in order to catch any error
      return await this.teamsService.findOne(cuid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new GraphQLException('Group not found', {
            extensions: { http: { status: HttpStatus.NOT_FOUND } },
          });
        }
      }
    }
  }

  @ResolveField()
  async users(@Parent() userGroup: UserGroup) {
    return this.usersService.findAllByTeam(userGroup.cuid);
  }

  @Mutation(() => UserGroup)
  createUserGroup(
    @Args('createUserGroupData') createUserGroupData: CreateUserGroupInput,
  ) {
    this.logger.debug('createUserGroup', { createUserGroupData });

    return this.teamsService.create(createUserGroupData);
  }

  @Mutation(() => UserGroup)
  updateUserGroup(
    @Args({ name: 'cuid', type: () => String }) cuid: UserGroup['cuid'],
    @Args({ name: 'updateUserGroupData', type: () => UpdateUserGroupInput })
    updateUserGroupData: UpdateUserGroupInput,
  ) {
    this.logger.debug('updateUserGroup', { updateUserGroupData });

    return this.teamsService.update(cuid, updateUserGroupData);
  }

  @Mutation(() => UserGroup)
  removeUserGroup(@Args('cuid', { type: () => String }) cuid: string) {
    this.logger.debug('removeUserGroup', { cuid });

    return this.teamsService.remove(cuid);
  }
}
