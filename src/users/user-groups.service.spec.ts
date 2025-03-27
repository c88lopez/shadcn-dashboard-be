import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupsService } from './user-groups.service';
import { PrismaService } from '../prisma.service';

describe('TeamsService', () => {
  let service: UserGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGroupsService, PrismaService],
    }).compile();

    service = module.get<UserGroupsService>(UserGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllByUser', async () => {
    const userId = 1;
    const result = await service.findAllByUser(userId);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty('cuid');
    expect(result[0]).toHaveProperty('name', 'default');
  });
});
