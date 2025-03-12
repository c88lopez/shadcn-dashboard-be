import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersResolver } from './users.resolver';
import { TeamsService } from '../teams/teams.service';

@Module({
  providers: [UsersService, PrismaService, UsersResolver, TeamsService],
  exports: [UsersService],
})
export class UsersModule {}
