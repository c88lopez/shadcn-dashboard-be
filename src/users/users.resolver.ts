import { Query, Resolver } from '@nestjs/graphql';

import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  findAll() {
    return this.usersService.findAll();
  }
}
