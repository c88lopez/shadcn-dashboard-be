import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PrismaService } from '../prisma.service';
import { CreatePlayerInput } from './inputs/create-player.input';
import { Player } from '@prisma/client';

describe('PlayersService', () => {
  let service: PlayersService;
  let prismaService: PrismaService;

  const newPlayerInput: CreatePlayerInput = {
    firstName: 'John',
    lastName: 'Doe',
  };

  const newCompletePlayerInput: CreatePlayerInput = {
    ...newPlayerInput,

    dateOfBirth: new Date('1990-01-01').getTime(),

    phoneNumber: '+54 11 6549 0774',
    email: 'jdoe@vandelay-labs.com',
    instagram: 'https://www.instagram.com/johndoe',
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

  describe('create', () => {
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
      const newPlayer = await service.create(newCompletePlayerInput);

      expect(newPlayer).toHaveProperty('cuid');

      expect(newPlayer).toHaveProperty(
        'firstName',
        newCompletePlayerInput.firstName,
      );
      expect(newPlayer).toHaveProperty(
        'lastName',
        newCompletePlayerInput.lastName,
      );

      expect(newPlayer).toHaveProperty(
        'dateOfBirth',
        new Date(newCompletePlayerInput.dateOfBirth),
      );

      expect(newPlayer).toHaveProperty(
        'phoneNumber',
        newCompletePlayerInput.phoneNumber,
      );
      expect(newPlayer).toHaveProperty('email', newCompletePlayerInput.email);
      expect(newPlayer).toHaveProperty(
        'instagram',
        newCompletePlayerInput.instagram,
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

  describe('update', () => {
    let player: Player;

    beforeEach(async () => {
      player = await service.create(newPlayerInput);
    });

    it("should update a player's first name", async () => {
      const updatedPlayer = await service.update(player.cuid, {
        firstName: 'Jane',
      });

      expect(updatedPlayer).toHaveProperty('firstName', 'Jane');
      expect(updatedPlayer).toHaveProperty('lastName', 'Doe');
    });
  });

  describe('remove', () => {
    let player: Player;

    beforeEach(async () => {
      player = await service.create(newPlayerInput);
    });

    it('should remove player', async () => {
      await service.remove(player.cuid);

      const deletedPlayer = await service.findOne(player.cuid);

      expect(deletedPlayer).toBeNull();
    });
  });
});
