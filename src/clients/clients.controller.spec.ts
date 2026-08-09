import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  let controller: ClientsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  describe('create', () => {
    it('deve chamar o service.create e retornar o cliente criado', async () => {
      const dto = { name: 'João', document: '12345678901', creditLimit: 50000 };
      mockService.create.mockResolvedValueOnce({ id: 'mock-id', ...dto });

      const result = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', 'mock-id');
    });
  });

  describe('findAll', () => {
    it('deve chamar o service.findAll e retornar a lista de clientes', async () => {
      mockService.findAll.mockResolvedValueOnce([{ id: 'mock-id' }]);

      const result = await controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'mock-id' }]);
    });
  });

  describe('findOne', () => {
    it('deve chamar o service.findOne e retornar o cliente', async () => {
      mockService.findOne.mockResolvedValueOnce({ id: 'mock-id' });

      const result = await controller.findOne('mock-id');
      expect(mockService.findOne).toHaveBeenCalledWith('mock-id');
      expect(result).toEqual({ id: 'mock-id' });
    });
  });
});
