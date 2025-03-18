import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prismaService: PrismaService) {}

  async create(createTeamInput: CreateTeamInput) {
    this.logger.debug('create', { createTeamInput });

    try {
      const createResult = await this.prismaService.team.create({
        data: {
          name: createTeamInput.name,
          users: {
            connect: [
              ...(createTeamInput.users ?? []).map((cuid) => ({ cuid })),
            ],
          },
        },
      });

      return this.findOne(createResult.cuid);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new HttpException('Invalid user list', 400);
      }

      this.logger.error(error);
      throw new HttpException('Server error', 500);
    }
  }

  findAll() {
    this.logger.debug('findAll');

    return this.prismaService.team.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(cuid: string) {
    this.logger.debug('findOne', { cuid });

    return this.prismaService.team.findUniqueOrThrow({ where: { cuid } });
  }

  findAllByUser(id: number) {
    this.logger.debug('findAllByUser', { id });

    return this.prismaService.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        teams: true,
      },
    });
  }

  async update(cuid: string, updateTeamInput: UpdateTeamInput) {
    this.logger.debug('update', { updateTeamInput });

    const transactionOperations = [];

    if (updateTeamInput.users !== undefined) {
      transactionOperations.push(
        this.prismaService.team.update({
          where: {
            cuid,
          },
          data: {
            users: {
              set: [],
            },
          },
        }),
      ); // We first remove all users from the team on the same transaction
    }

    transactionOperations.push(
      this.prismaService.team.update({
        where: {
          cuid,
        },
        data: {
          name: updateTeamInput.name,
          users: {
            connect: [
              ...(updateTeamInput.users ?? []).map((cuid) => ({ cuid })),
            ],
          },
        },
      }),
    );

    await this.prismaService.$transaction(transactionOperations);

    return this.findOne(cuid);
  }

  remove(cuid: string) {
    this.logger.debug('remove', { cuid });

    return this.prismaService.team.delete({
      where: {
        cuid,
      },
    });
  }
}
