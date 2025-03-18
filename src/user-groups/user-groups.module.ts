import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsResolver } from './user-groups.resolver';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [
    UserGroupsResolver,
    UserGroupsService,
    PrismaService,
    UsersService,
  ],
})
export class UserGroupsModule {}
