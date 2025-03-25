import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from './users/entities/user.entity';

declare module 'Express' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Request {
    user?: User;
  }
}

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() request: Request) {
    return request.user;
  }
}
