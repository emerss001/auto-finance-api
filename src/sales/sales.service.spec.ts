import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sale } from './entities/sales.entity';
import { Financing } from './entities/financings.entity';

describe('SalesService', () => {
  let service: SalesService;
  let mockSalesRepository: any;
  let mockFinancingsRepository: any;

  beforeEach(async () => {
    mockSalesRepository = {
      find: jest.fn(),
    };
    mockFinancingsRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSalesRepository,
        },
        {
          provide: getRepositoryToken(Financing),
          useValue: mockFinancingsRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  describe('findAll', () => {
    it('deve retornar a lista de vendas com as devidas relações', async () => {
      mockSalesRepository.find.mockResolvedValueOnce([{ id: 'mock-sale' }]);

      const result = await service.findAll();

      expect(mockSalesRepository.find).toHaveBeenCalledWith({
        relations: {
          client: true,
          vehicle: true,
          financing: true,
        },
      });
      expect(result).toEqual([{ id: 'mock-sale' }]);
    });
  });

  describe('findAllFinancings', () => {
    it('deve retornar a lista de financiamentos com as devidas relações', async () => {
      mockFinancingsRepository.find.mockResolvedValueOnce([
        { id: 'mock-financing' },
      ]);

      const result = await service.findAllFinancings();

      expect(mockFinancingsRepository.find).toHaveBeenCalledWith({
        relations: {
          sale: {
            client: true,
            vehicle: true,
          },
        },
      });
      expect(result).toEqual([{ id: 'mock-financing' }]);
    });
  });
});
