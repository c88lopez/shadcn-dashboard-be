import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CreatePlayerSchema, UpdatePlayerSchema } from '@vandelay-labs/schemas';
import { PrismaService } from '../prisma.service';
import { CreatePlayerInput } from './inputs/create-player.input';
import { UpdatePlayerInput } from './inputs/update-player.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(private prismaService: PrismaService) {}

  async create(createPlayerInput: CreatePlayerInput) {
    this.logger.debug('create', { createPlayerInput });

    const schemaValidation = CreatePlayerSchema.safeParse(createPlayerInput);

    if (!schemaValidation.success) {
      throw new HttpException(
        schemaValidation.error.issues[0].message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateOfBirth = new Date(createPlayerInput.dateOfBirth);

    if (!dateOfBirth) {
      throw new HttpException('Invalid date of birth', HttpStatus.BAD_REQUEST);
    }

    try {
      const createResult = await this.prismaService.player.create({
        data: {
          firstName: createPlayerInput.firstName,
          lastName: createPlayerInput.lastName,
          dateOfBirth: createPlayerInput.dateOfBirth
            ? new Date(createPlayerInput.dateOfBirth)
            : undefined,
          phoneNumber: createPlayerInput.phoneNumber,
          email: createPlayerInput.email,
          instagram: createPlayerInput.instagram,
        },
      });

      return this.findOne(createResult.cuid);
    } catch (error) {
      this.logger.error(error);
      throw new Error('Server error');
    }
  }

  findAll() {
    this.logger.debug('findAll');

    return this.prismaService.player.findMany();
  }

  findOne(cuid: string) {
    this.logger.debug('findOne', { cuid });

    return this.prismaService.player.findUnique({
      where: {
        cuid,
      },
    });
  }

  update(cuid: string, updatePlayerInput: UpdatePlayerInput) {
    this.logger.debug('update', { cuid, updatePlayerInput });

    const schemaValidation = UpdatePlayerSchema.safeParse(updatePlayerInput);

    if (!schemaValidation.success) {
      throw new BadRequestException(schemaValidation.error.issues[0].message);
    }

    const dateOfBirth = new Date(updatePlayerInput.dateOfBirth);

    const data: Prisma.PlayerUpdateInput = {
      ...updatePlayerInput,
      dateOfBirth: updatePlayerInput.dateOfBirth ? dateOfBirth : undefined,
    };

    return this.prismaService.player.update({
      where: {
        cuid,
      },
      data,
    });
  }

  remove(cuid: string) {
    this.logger.debug('remove', { cuid });

    return this.prismaService.player.delete({
      where: {
        cuid,
      },
    });
  }
}
