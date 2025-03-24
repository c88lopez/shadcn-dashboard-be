import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersResolver } from './users.resolver';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsResolver } from './user-groups.resolver';

@Module({
  providers: [
    PrismaService,
    UsersService,
    UsersResolver,
    UserGroupsService,
    UserGroupsResolver,
  ],
  exports: [UsersService],
})
export class UsersModule {}
