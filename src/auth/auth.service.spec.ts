import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if validation succeeds', async () => {
      const user = {
        id: 1,
        cuid: 'some-cuid',
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password',
      );
      expect(result).toEqual({
        cuid: 'some-cuid',
        email: 'test@example.com',
        username: 'testuser',
        id: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });

    it('should return null if password does not match', async () => {
      const user = {
        id: 1,
        cuid: 'some-cuid',
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword',
      );
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = {
        cuid: 'some-cuid',
        email: 'test@example.com',
        username: 'testuser',
      };
      const payload = {
        email: user.email,
        sub: user.cuid,
        username: user.username,
      };
      const accessToken = 'mockAccessToken';
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.login(user as any);
      expect(result).toEqual({ access_token: accessToken });
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
