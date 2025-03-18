import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prismaService: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    this.logger.debug('create');

    try {
      const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

      const createResult = await this.prismaService.user.create({
        data: {
          email: createUserInput.email,
          username: createUserInput.username,
          password: hashedPassword,
          groups: {
            connect: [
              ...(createUserInput.teams ?? []).map((cuid) => ({ cuid })),
            ],
          },
        },
      });

      return this.findOne(createResult.cuid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'User with this email already exists',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (error.code === 'P2025') {
          throw new HttpException(
            'Invalid list of teams',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }

      this.logger.error(error);
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
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
            cuid: teamId,
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

    if (updateUserInput.teams !== undefined) {
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
            connect: [
              ...(updateUserInput.teams ?? []).map((cuid) => ({ cuid })),
            ],
          },
        },
      }),
    );

    await this.prismaService.$transaction(transactionOperations);

    return this.findOne(cuid);
  }

  remove(cuid: string) {
    this.logger.debug('remove');

    return this.prismaService.user.delete({
      where: {
        cuid,
      },
    });
  }
}
