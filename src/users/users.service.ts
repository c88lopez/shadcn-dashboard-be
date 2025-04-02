import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    this.logger.debug('create', { createUserInput });

    try {
      const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

      const createResult = await this.prismaService.user.create({
        data: {
          email: createUserInput.email,
          username: createUserInput.username,
          password: hashedPassword,
          groups: {
            create: (createUserInput.groups ?? []).map((cuid) => ({
              userGroup: {
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('User with this email already exists');
        }

        if (error.code === 'P2025') {
          throw new BadRequestException('Invalid list of teams');
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid payload');
      }

      this.logger.error(error);
      throw new InternalServerErrorException('Server error');
    }
  }

  findAll() {
    this.logger.debug('findAll');

    return this.prismaService.user.findMany({
      orderBy: { id: 'asc' },
      include: {
        groups: true,
      },
    });
  }

  findAllByTeam(teamId: string) {
    this.logger.debug('findAllByTeam');

    return this.prismaService.user.findMany({
      where: {
        groups: {
          some: {
            userGroup: {
              cuid: teamId,
            },
          },
        },
      },
    });
  }

  findOne(cuid: string) {
    this.logger.debug('findOne');

    return this.prismaService.user.findUniqueOrThrow({
      where: {
        cuid,
      },
    });
  }

  findByEmail(email: string) {
    this.logger.debug('findByEmail');

    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(cuid: string, updateUserInput: UpdateUserInput) {
    this.logger.debug('update');

    const transactionOperations = [];

    if (updateUserInput.groups !== undefined) {
      transactionOperations.push(
        this.prismaService.user.update({
          where: {
            cuid,
          },
          data: {
            groups: {
              set: [],
            },
          },
        }),
      ); // We first remove all teams from the user on the same transaction
    }

    transactionOperations.push(
      this.prismaService.user.update({
        where: {
          cuid,
        },
        data: {
          email: updateUserInput.email,
          username: updateUserInput.username,
          password: updateUserInput.password,
          groups: {
            create: (updateUserInput.groups ?? []).map((cuid) => ({
              userGroup: {
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

  async remove(id) {
    this.logger.debug('remove');

    await this.prismaService.userUserGroup.deleteMany({
      where: { userId: id },
    });

    return this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
