import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PlayersResolver, PlayersService, PrismaService],
})
export class MatchesModule {}
