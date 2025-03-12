import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { Prisma } from '@prisma/client';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';
import { HttpStatus, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Resolver(() => Team)
export class TeamsResolver {
  private readonly logger = new Logger(TeamsResolver.name);

  constructor(
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => [Team], { name: 'teams' })
  findAll() {
    this.logger.debug('findAll');

    return this.teamsService.findAll();
  }

  @Query(() => Team, { name: 'team' })
  async findOne(@Args('cuid', { type: () => String }) cuid: string) {
    this.logger.debug('findOne', { cuid });

    try {
      // We need to await here in order to catch any error
      return await this.teamsService.findOne(cuid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new GraphQLException('Team not found', {
            extensions: { http: { status: HttpStatus.NOT_FOUND } },
          });
        }
      }
    }
  }

  @ResolveField()
  async users(@Parent() team: Team) {
    return this.usersService.findAllByTeam(team.cuid);
  }

  @Mutation(() => Team)
  createTeam(@Args('createTeamInput') createTeamInput: CreateTeamInput) {
    this.logger.debug('createTeam', { createTeamInput });

    return this.teamsService.create(createTeamInput);
  }

  @Mutation(() => Team)
  updateTeam(@Args('updateTeamInput') updateTeamInput: UpdateTeamInput) {
    this.logger.debug('updateTeam', { updateTeamInput });

    return this.teamsService.update(updateTeamInput.cuid, updateTeamInput);
  }

  @Mutation(() => Team)
  removeTeam(@Args('cuid', { type: () => String }) cuid: string) {
    this.logger.debug('removeTeam', { cuid });

    return this.teamsService.remove(cuid);
  }
}
