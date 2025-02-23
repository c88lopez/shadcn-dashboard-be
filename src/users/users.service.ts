import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      const createResult = await this.prismaService.user.create({ data });

      return this.findOne(createResult.cuid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            message: 'User with this email already exists',
          };
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return {
          message: 'Invalid payload',
        };
      }
    }

    return;
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(cuid: string) {
    return this.prismaService.user.findUniqueOrThrow({
      where: {
        cuid,
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
