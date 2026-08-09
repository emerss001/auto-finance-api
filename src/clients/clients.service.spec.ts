import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from './entities/clients.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((entity) => ({ id: 'mock-id', ...entity })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  describe('create', () => {
    it('deve criar um cliente com sucesso', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);

      const dto = { name: 'João', document: '12345678901', creditLimit: 50000 };
      const result = await service.create(dto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        document: '12345678901',
      });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'mock-id');
    });

    it('deve retornar ConflictException se o documento já existir', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce({ id: 'existing-id' });

      const dto = { name: 'João', document: '12345678901', creditLimit: 50000 };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar um array de clientes', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'mock-id' }]);

      const result = await service.findAll();
      expect(result).toEqual([{ id: 'mock-id' }]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o cliente se ele existir', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce({ id: 'mock-id' });

      const result = await service.findOne('mock-id');
      expect(result).toEqual({ id: 'mock-id' });
    });

    it('deve retornar NotFoundException se o cliente não existir', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(service.findOne('mock-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
