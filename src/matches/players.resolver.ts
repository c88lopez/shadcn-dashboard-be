import { Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { PlayersService } from './players.service';

@Resolver()
export class PlayersResolver {
  private readonly logger = new Logger(PlayersResolver.name);

  constructor(private readonly playersService: PlayersService) {}
}
