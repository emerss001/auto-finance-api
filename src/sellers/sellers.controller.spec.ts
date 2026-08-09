import { Test, TestingModule } from '@nestjs/testing';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

describe('SellersController', () => {
  let controller: SellersController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellersController],
      providers: [
        {
          provide: SellersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SellersController>(SellersController);
  });

  describe('create', () => {
    it('deve chamar o service.create e retornar o vendedor criado', async () => {
      const dto = { name: 'Vendedor Teste', commissionRate: 5 };
      mockService.create.mockResolvedValueOnce({
        id: 'mock-id',
        ...dto,
      });

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', 'mock-id');
      expect(result).toHaveProperty('name', 'Vendedor Teste');
      expect(result).toHaveProperty('commissionRate', 5);
    });
  });

  describe('findAll', () => {
    it('deve chamar o service.findAll e retornar a lista de vendedores', async () => {
      mockService.findAll.mockResolvedValueOnce([
        { id: 'seller-1', name: 'João', commissionRate: 5 },
        { id: 'seller-2', name: 'Maria', commissionRate: 10 },
      ]);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'seller-1');
    });

    it('deve retornar um array vazio quando não houver vendedores', async () => {
      mockService.findAll.mockResolvedValueOnce([]);

      const result = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
