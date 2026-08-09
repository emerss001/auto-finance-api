import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { LiquidateFinancingUseCase } from './use-cases/liquidate-financing.use-case';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  let mockProcessVehicleSaleUseCase: any;
  let mockLiquidateFinancingUseCase: any;
  let mockSalesService: any;

  beforeEach(async () => {
    mockProcessVehicleSaleUseCase = { execute: jest.fn() };
    mockLiquidateFinancingUseCase = { execute: jest.fn() };
    mockSalesService = {
      findAll: jest.fn(),
      findAllFinancings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: ProcessVehicleSaleUseCase,
          useValue: mockProcessVehicleSaleUseCase,
        },
        {
          provide: LiquidateFinancingUseCase,
          useValue: mockLiquidateFinancingUseCase,
        },
        { provide: SalesService, useValue: mockSalesService },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  describe('invoiceVehicleSale', () => {
    it('deve chamar ProcessVehicleSaleUseCase e retornar um InvoiceResponseDto', async () => {
      const dto = { client_id: 'client-id', vehicle_id: 'vehicle-id' };
      const mockSale: any = {
        id: 'sale-id',
        amount: 50000,
        status: 'COMPLETED',
        createdAt: new Date(),
        client: { id: 'client-id', name: 'João' },
        vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
      };

      mockProcessVehicleSaleUseCase.execute.mockResolvedValueOnce(mockSale);

      const result = await controller.invoiceVehicleSale(dto);

      expect(mockProcessVehicleSaleUseCase.execute).toHaveBeenCalledWith(
        'client-id',
        'vehicle-id',
      );
      expect(result.invoiceId).toBe('sale-id');
    });
  });

  describe('liquidateFinancing', () => {
    it('deve chamar LiquidateFinancingUseCase e retornar o financiamento', async () => {
      const mockFinancing = { id: 'fin-id', status: 'LIQUIDATED' };
      mockLiquidateFinancingUseCase.execute.mockResolvedValueOnce(
        mockFinancing,
      );

      const result = await controller.liquidateFinancing('fin-id');

      expect(mockLiquidateFinancingUseCase.execute).toHaveBeenCalledWith(
        'fin-id',
      );
      expect(result).toEqual(mockFinancing);
    });
  });

  describe('findAll', () => {
    it('deve chamar SalesService e retornar array de SaleListResponseDto', async () => {
      const mockSale: any = {
        id: 'sale-id',
        amount: 50000,
        status: 'COMPLETED',
        createdAt: new Date(),
        client: { id: 'client-id', name: 'João' },
        vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
      };
      mockSalesService.findAll.mockResolvedValueOnce([mockSale]);

      const result = await controller.findAll();

      expect(mockSalesService.findAll).toHaveBeenCalled();
      expect(result[0]).toHaveProperty('id', 'sale-id');
    });
  });

  describe('findAllFinancings', () => {
    it('deve chamar SalesService e retornar array de FinancingListResponseDto', async () => {
      const mockFinancing: any = {
        id: 'fin-id',
        status: 'PENDING',
        amount: 20000,
        installments: 12,
        createdAt: new Date(),
        sale: {
          client: { id: 'client-id', name: 'João' },
          vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
        },
      };
      mockSalesService.findAllFinancings.mockResolvedValueOnce([mockFinancing]);

      const result = await controller.findAllFinancings();

      expect(mockSalesService.findAllFinancings).toHaveBeenCalled();
      expect(result[0]).toHaveProperty('id', 'fin-id');
    });
  });
});
