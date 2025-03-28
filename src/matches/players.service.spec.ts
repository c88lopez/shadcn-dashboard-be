import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PrismaService } from '../prisma.service';
import { CreatePlayerInput } from './inputs/create-player.input';

describe('PlayersService', () => {
  let service: PlayersService;
  let prismaService: PrismaService;

  const newPlayerInput: CreatePlayerInput = {
    firstName: 'John',
    lastName: 'Doe',
  };

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
    const newPlayerInputComplete: CreatePlayerInput = {
      ...newPlayerInput,

      dateOfBirth: new Date('1990-01-01').getTime(),

      phoneNumber: '+54 11 6549 0774',
      email: 'jdoe@vandelay-labs.com',
      instagram: 'https://www.instagram.com/johndoe',
    };

    const newPlayer = await service.create(newPlayerInputComplete);

    expect(newPlayer).toHaveProperty('cuid');

    expect(newPlayer).toHaveProperty(
      'firstName',
      newPlayerInputComplete.firstName,
    );
    expect(newPlayer).toHaveProperty(
      'lastName',
      newPlayerInputComplete.lastName,
    );

    expect(newPlayer).toHaveProperty(
      'dateOfBirth',
      new Date(newPlayerInputComplete.dateOfBirth),
    );

    expect(newPlayer).toHaveProperty(
      'phoneNumber',
      newPlayerInputComplete.phoneNumber,
    );
    expect(newPlayer).toHaveProperty('email', newPlayerInputComplete.email);
    expect(newPlayer).toHaveProperty(
      'instagram',
      newPlayerInputComplete.instagram,
    );
  });

  it('should not create a player with no first name', async () => {
    const badPlayerInput: Omit<CreatePlayerInput, 'firstName'> = {
      lastName: 'Doe',
    };

    await expect(
      service.create(badPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('first name is required');
  });

  it('should not create a player with empty first name', async () => {
    const badPlayerInput: CreatePlayerInput = {
      firstName: '',
      lastName: 'Doe',
    };

    await expect(
      service.create(badPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('first name must be at least 2 characters');
  });

  it('should not create a player with string date of birth', async () => {
    const badPlayerInput: CreatePlayerInput = {
      firstName: 'John',
      lastName: 'Doe',

      dateOfBirth: 'asd' as unknown as number,
    };
    await expect(
      service.create(badPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('Expected number, received string');
  });

  it('should not create a player with invalid (old) date of birth', async () => {
    const badPlayerInput: CreatePlayerInput = {
      firstName: 'John',
      lastName: 'Doe',

      dateOfBirth: new Date('1800-01-01').getTime(),
    };

    await expect(
      service.create(badPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('date of birth should be realistic');
  });

  it('should not create a player with invalid (future) date of birth', async () => {
    const badPlayerInput: CreatePlayerInput = {
      firstName: 'John',
      lastName: 'Doe',

      dateOfBirth: new Date('1800-01-01').getTime(),
    };
    await expect(
      service.create(badPlayerInput as unknown as CreatePlayerInput),
    ).rejects.toThrow('date of birth should be realistic');
  });
});
