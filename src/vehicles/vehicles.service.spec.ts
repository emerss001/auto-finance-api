import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicles.entity';
import { ConflictException } from '@nestjs/common';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => ({ id: 'mock-id', ...entity })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  describe('create', () => {
    it('deve criar um veículo com sucesso', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);

      const dto = { brand: 'Fiat', model: 'Uno', year: 2020, chassi: '12345678901234567', price: 30000 };
      const result = await service.create(dto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ chassi: dto.chassi });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'mock-id');
    });

    it('deve retornar ConflictException se o chassi já existir', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce({ id: 'existing-id' });

      const dto = { brand: 'Fiat', model: 'Uno', year: 2020, chassi: '12345678901234567', price: 30000 };
      
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar um array de veículos', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'mock-id' }]);
      
      const result = await service.findAll();
      expect(result).toEqual([{ id: 'mock-id' }]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
