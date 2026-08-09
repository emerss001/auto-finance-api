import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  describe('create', () => {
    it('deve chamar o service.create e retornar o veículo criado', async () => {
      const dto = { brand: 'Fiat', model: 'Uno', year: 2020, chassi: '12345678901234567', price: 30000 };
      mockService.create.mockResolvedValueOnce({ id: 'mock-id', ...dto });

      const result = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', 'mock-id');
    });
  });

  describe('findAll', () => {
    it('deve chamar o service.findAll e retornar a lista de veículos', async () => {
      mockService.findAll.mockResolvedValueOnce([{ id: 'mock-id' }]);
      
      const result = await controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'mock-id' }]);
    });
  });
});
