import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupsResolver } from './user-groups.resolver';
import { UserGroupsService } from './user-groups.service';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';

describe('TeamsResolver', () => {
  let resolver: UserGroupsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupsResolver,
        UserGroupsService,
        UsersService,
        PrismaService,
      ],
    }).compile();

    resolver = module.get<UserGroupsResolver>(UserGroupsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
