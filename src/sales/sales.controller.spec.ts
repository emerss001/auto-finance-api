import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { LiquidateFinancingUseCase } from './use-cases/liquidate-financing.use-case';
import { RejectFinancingUseCase } from './use-cases/reject-financing.use-case';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  let mockProcessVehicleSaleUseCase: any;
  let mockLiquidateFinancingUseCase: any;
  let mockRejectFinancingUseCase: any;
  let mockSalesService: any;

  beforeEach(async () => {
    mockProcessVehicleSaleUseCase = { execute: jest.fn() };
    mockLiquidateFinancingUseCase = { execute: jest.fn() };
    mockRejectFinancingUseCase = { execute: jest.fn() };
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
        {
          provide: RejectFinancingUseCase,
          useValue: mockRejectFinancingUseCase,
        },
        { provide: SalesService, useValue: mockSalesService },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  describe('invoiceVehicleSale', () => {
    it('deve chamar ProcessVehicleSaleUseCase com o DTO e retornar um InvoiceResponseDto', async () => {
      const dto = {
        client_id: 'client-id',
        vehicle_id: 'vehicle-id',
        seller_id: 'seller-id',
      };
      const mockSale: any = {
        id: 'sale-id',
        amount: 50000,
        status: 'COMPLETED',
        createdAt: new Date(),
        client: { id: 'client-id', name: 'João', document: '12345678901' },
        vehicle: {
          id: 'vehicle-id',
          brand: 'Ford',
          model: 'Ka',
          chassi: '12345678901234567',
        },
      };

      mockProcessVehicleSaleUseCase.execute.mockResolvedValueOnce(mockSale);

      const result = await controller.invoiceVehicleSale(dto);

      expect(mockProcessVehicleSaleUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.invoiceId).toBe('sale-id');
      expect(result.amount).toBe(50000);
      expect(result.status).toBe('COMPLETED');
      expect(result.client).toEqual({
        id: 'client-id',
        name: 'João',
        document: '12345678901',
      });
      expect(result.vehicle).toEqual({
        id: 'vehicle-id',
        brand: 'Ford',
        model: 'Ka',
        chassi: '12345678901234567',
      });
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

  describe('rejectFinancing', () => {
    it('deve chamar RejectFinancingUseCase e retornar o financiamento rejeitado', async () => {
      const mockFinancing = { id: 'fin-id', status: 'REJECTED' };
      mockRejectFinancingUseCase.execute.mockResolvedValueOnce(mockFinancing);

      const result = await controller.rejectFinancing('fin-id');

      expect(mockRejectFinancingUseCase.execute).toHaveBeenCalledWith(
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
        discount_amount: 5000,
        status: 'COMPLETED',
        createdAt: new Date(),
        client: { id: 'client-id', name: 'João', document: '12345678901' },
        vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
        financing: { status: 'PENDING' },
      };
      mockSalesService.findAll.mockResolvedValueOnce([mockSale]);

      const result = await controller.findAll();

      expect(mockSalesService.findAll).toHaveBeenCalled();
      expect(result[0]).toHaveProperty('id', 'sale-id');
      expect(result[0]).toHaveProperty('discountAmount', 5000);
      expect(result[0]).toHaveProperty('financingStatus', 'PENDING');
    });

    it('deve retornar financingStatus null quando a venda não possui financiamento', async () => {
      const mockSale: any = {
        id: 'sale-id',
        amount: 50000,
        discount_amount: 0,
        status: 'COMPLETED',
        createdAt: new Date(),
        client: { id: 'client-id', name: 'João', document: '12345678901' },
        vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
        financing: null,
      };
      mockSalesService.findAll.mockResolvedValueOnce([mockSale]);

      const result = await controller.findAll();

      expect(result[0]).toHaveProperty('financingStatus', null);
    });
  });

  describe('findAllFinancings', () => {
    it('deve chamar SalesService e retornar array de FinancingListResponseDto', async () => {
      const mockFinancing: any = {
        id: 'fin-id',
        status: 'PENDING',
        liquidatedAt: null,
        sale: {
          amount: 20000,
          client: {
            id: 'client-id',
            name: 'João',
            document: '12345678901',
          },
          vehicle: { id: 'vehicle-id', brand: 'Ford', model: 'Ka' },
        },
      };
      mockSalesService.findAllFinancings.mockResolvedValueOnce([
        mockFinancing,
      ]);

      const result = await controller.findAllFinancings();

      expect(mockSalesService.findAllFinancings).toHaveBeenCalled();
      expect(result[0]).toHaveProperty('id', 'fin-id');
      expect(result[0]).toHaveProperty('saleAmount', 20000);
      expect(result[0]).toHaveProperty('clientName', 'João');
      expect(result[0]).toHaveProperty('vehicleModel', 'Ka');
    });
  });
});
