import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsResolver } from './teams.resolver';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [TeamsResolver, TeamsService, PrismaService, UsersService],
})
export class TeamsModule {}
