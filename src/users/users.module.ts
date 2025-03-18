import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersResolver } from './users.resolver';
import { UserGroupsService } from '../user-groups/user-groups.service';

@Module({
  providers: [UsersService, PrismaService, UsersResolver, UserGroupsService],
  exports: [UsersService],
})
export class UsersModule {}
