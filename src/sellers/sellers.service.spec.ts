import { Test, TestingModule } from '@nestjs/testing';
import { SellersService } from './sellers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Seller } from './entities/sellers.entity';

describe('SellersService', () => {
  let service: SellersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((entity) => ({ id: 'mock-id', ...entity })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellersService,
        {
          provide: getRepositoryToken(Seller),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SellersService>(SellersService);
  });

  describe('create', () => {
    it('deve criar um vendedor com sucesso', async () => {
      const dto = { name: 'Vendedor Teste', commissionRate: 5 };
      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Vendedor Teste',
        commissionRate: 5,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'mock-id');
      expect(result).toHaveProperty('name', 'Vendedor Teste');
      expect(result).toHaveProperty('commissionRate', 5);
    });

    it('deve criar um vendedor com comissão zero', async () => {
      const dto = { name: 'Vendedor Sem Comissão', commissionRate: 0 };
      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Vendedor Sem Comissão',
        commissionRate: 0,
      });
      expect(result).toHaveProperty('commissionRate', 0);
    });
  });

  describe('findAll', () => {
    it('deve retornar um array de vendedores', async () => {
      mockRepository.find.mockResolvedValueOnce([
        { id: 'seller-1', name: 'João', commissionRate: 5 },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        { id: 'seller-1', name: 'João', commissionRate: 5 },
      ]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('deve retornar um array vazio quando não houver vendedores', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
