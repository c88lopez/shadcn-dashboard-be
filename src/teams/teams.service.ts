import { Injectable } from '@nestjs/common';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prismaService: PrismaService) {}

  async create(createTeamInput: CreateTeamInput) {
    const createResult = await this.prismaService.team.create({
      data: createTeamInput,
    });

    return this.findOne(createResult.cuid);
  }

  findAll() {
    return this.prismaService.team.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(cuid: string) {
    return this.prismaService.team.findUniqueOrThrow({ where: { cuid } });
  }

  update(cuid: string, updateTeamInput: UpdateTeamInput) {
    return this.prismaService.team.update({
      where: {
        cuid,
      },
      data: updateTeamInput,
    });
  }

  remove(cuid: string) {
    return this.prismaService.team.delete({
      where: {
        cuid,
      },
    });
  }
}
