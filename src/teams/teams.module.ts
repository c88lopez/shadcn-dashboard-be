import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsResolver } from './teams.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [TeamsResolver, TeamsService, PrismaService],
})
export class TeamsModule {}
