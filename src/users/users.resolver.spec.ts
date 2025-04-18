import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UserGroupsService } from './user-groups.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        UsersService,
        UserGroupsService,
        PrismaService,
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return an array of users', async () => {
    const users = await resolver.findAll({ req: { user: { id: 'dummy' } } });

    expect(users.length).toBeGreaterThanOrEqual(1);
  });
});
