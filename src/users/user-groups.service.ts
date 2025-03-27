import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUserGroupInput } from './inputs/create-user-group.input';
import { UpdateUserGroupInput } from './inputs/update-user-group.input';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { UserGroup } from './entities/user-group.entity';

@Injectable()
export class UserGroupsService {
  private readonly logger = new Logger(UserGroupsService.name);

  constructor(private prismaService: PrismaService) {}

  async create(createTeamInput: CreateUserGroupInput) {
    this.logger.debug('create', { createTeamInput });

    try {
      const createResult = await this.prismaService.userGroup.create({
        data: {
          name: createTeamInput.name,
          users: {
            create: (createTeamInput.users ?? []).map((cuid) => ({
              user: {
                connect: {
                  cuid,
                },
              },
            })),
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

    return this.prismaService.userGroup.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(cuid: string) {
    this.logger.debug('findOne', { cuid });

    return this.prismaService.userGroup.findUniqueOrThrow({ where: { cuid } });
  }

  async findAllByUser(userId: number) {
    this.logger.debug('findAllByUser', { userId });

    return (
      await this.prismaService.userUserGroup.findMany({
        where: {
          userId,
        },
        include: {
          userGroup: true,
        },
      })
    ).map((userUserGroup): UserGroup => userUserGroup.userGroup);
  }

  async update(cuid: string, updateTeamInput: UpdateUserGroupInput) {
    this.logger.debug('update', { updateTeamInput });

    const transactionOperations = [];

    if (updateTeamInput.users !== undefined) {
      transactionOperations.push(
        this.prismaService.userGroup.update({
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
      this.prismaService.userGroup.update({
        where: {
          cuid,
        },
        data: {
          name: updateTeamInput.name,
          users: {
            create: (updateTeamInput.users ?? []).map((cuid) => ({
              user: {
                connect: {
                  cuid,
                },
              },
            })),
          },
        },
      }),
    );

    await this.prismaService.$transaction(transactionOperations);

    return this.findOne(cuid);
  }

  remove(cuid: string) {
    this.logger.debug('remove', { cuid });

    return this.prismaService.userGroup.delete({
      where: {
        cuid,
      },
    });
  }
}
