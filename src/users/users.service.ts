import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserInput } from './inputs/create-user.input';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    try {
      const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

      const createResult = await this.prismaService.user.create({
        data: {
          email: createUserInput.email,
          username: createUserInput.username,
          password: hashedPassword,
          teams: {
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
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException('Invalid payload', HttpStatus.BAD_REQUEST);
      }
    }

    return;
  }

  findAll() {
    return this.prismaService.user.findMany({
      orderBy: { id: 'asc' },
      include: {
        teams: true,
      },
    });
  }

  findAllByTeam(teamId: string) {
    return this.prismaService.user.findMany({
      where: {
        teams: {
          some: {
            cuid: teamId,
          },
        },
      },
    });
  }

  findOne(cuid: string) {
    return this.prismaService.user.findUniqueOrThrow({
      where: {
        cuid,
      },
    });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(cuid: string, updateUserData: Prisma.UserUpdateInput) {
    return this.prismaService.user.update({
      where: {
        cuid,
      },
      data: updateUserData,
    });
  }

  remove(cuid: string) {
    return this.prismaService.user.delete({
      where: {
        cuid,
      },
    });
  }
}
