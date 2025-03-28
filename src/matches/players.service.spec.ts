import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PrismaService } from '../prisma.service';
import { CreatePlayerInput } from './inputs/create-player.input';

describe('PlayersService', () => {
  let service: PlayersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersService, PrismaService],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.player.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all players', async () => {
    const players = await service.findAll();
    expect(players).toBeDefined();
  });

  it('should create a player with just required data', async () => {
    const newPlayerInput: CreatePlayerInput = {
      firstName: 'John',
      lastName: 'Doe',
    };

    try {
      const newPlayer = await service.create(newPlayerInput);

      expect(newPlayer).toHaveProperty('cuid');

      expect(newPlayer).toHaveProperty('firstName', newPlayerInput.firstName);
      expect(newPlayer).toHaveProperty('lastName', newPlayerInput.lastName);
    } catch (error) {
      expect(error).not.toBeDefined();
    }
  });

  it('should create a player with full data', async () => {
    const newPlayerInput: CreatePlayerInput = {
      firstName: 'John',
      lastName: 'Doe',

      dateOfBirth: new Date('1990-01-01').getTime(),

      phoneNumber: '+54 11 6549 0774',
      email: 'jdoe@vandelay-labs.com',
      instagram: 'https://www.instagram.com/johndoe',
    };

    const newPlayer = await service.create(newPlayerInput);

    expect(newPlayer).toHaveProperty('cuid');

    expect(newPlayer).toHaveProperty('firstName', newPlayerInput.firstName);
    expect(newPlayer).toHaveProperty('lastName', newPlayerInput.lastName);

    expect(newPlayer).toHaveProperty(
      'dateOfBirth',
      new Date(newPlayerInput.dateOfBirth),
    );

    expect(newPlayer).toHaveProperty('phoneNumber', newPlayerInput.phoneNumber);
    expect(newPlayer).toHaveProperty('email', newPlayerInput.email);
    expect(newPlayer).toHaveProperty('instagram', newPlayerInput.instagram);
  });

  it('should not create a player with no first name', async () => {
    const newPlayerInput: Omit<CreatePlayerInput, 'firstName'> = {
      lastName: 'Doe',
    };

    await expect(
      service.create(newPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('first name is required');
  });

  it('should not create a player with empty first name', async () => {
    const newPlayerInput: CreatePlayerInput = {
      firstName: '',
      lastName: 'Doe',
    };

    await expect(
      service.create(newPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('first name must be at least 2 characters');
  });
});
