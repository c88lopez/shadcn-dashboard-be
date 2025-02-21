import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: Prisma.UserCreateInput) {
    this.logger.log('Creating a new user', { data });

    return this.usersService.create(data);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':cuid')
  findOne(@Param('cuid') cuid: string) {
    return this.usersService.findOne(cuid);
  }

  @Patch(':cuid')
  update(
    @Param('cuid') cuid: string,
    @Body() updateUserData: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(cuid, updateUserData);
  }

  @Delete(':cuid')
  remove(@Param('id') cuid: string) {
    return this.usersService.remove(cuid);
  }
}
