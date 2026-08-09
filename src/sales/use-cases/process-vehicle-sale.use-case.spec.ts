import { Test, TestingModule } from '@nestjs/testing';
import { ProcessVehicleSaleUseCase } from './process-vehicle-sale.use-case';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateSaleDto, DiscountType } from '../dto/create-sale.dto';

describe('ProcessVehicleSaleUseCase', () => {
  let useCase: ProcessVehicleSaleUseCase;

  let mockEntityManager: any;
  let mockDataSource: any;

  const mockVehicle = {
    id: 'vehicle-id',
    status: 'AVAILABLE',
    price: 60000,
  };

  const mockSeller = {
    id: 'seller-id',
    name: 'Vendedor Teste',
    commissionRate: 5,
  };

  const mockClient = {
    id: 'client-id',
    creditLimit: 100000,
  };

  const baseDto: CreateSaleDto = {
    client_id: 'client-id',
    vehicle_id: 'vehicle-id',
    seller_id: 'seller-id',
  };

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((_entity, dto) => dto),
      save: jest.fn().mockImplementation((_entity, data) => data || _entity),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return await cb(mockEntityManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessVehicleSaleUseCase,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    useCase = module.get<ProcessVehicleSaleUseCase>(ProcessVehicleSaleUseCase);
  });

  describe('Caminhos de Falha (Regras de Negócio)', () => {
    it('deve rejeitar (NotFoundException) se o veículo não for encontrado', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (ConflictException) se o veículo já estiver vendido', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce({
        id: 'vehicle-id',
        status: 'SOLD',
      });

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve rejeitar (NotFoundException) se o vendedor não for encontrado', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockVehicle })
        .mockResolvedValueOnce(null); // seller not found

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (NotFoundException) se o cliente não for encontrado', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockVehicle })
        .mockResolvedValueOnce({ ...mockSeller })
        .mockResolvedValueOnce(null); // client not found

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o desconto percentual tornar o preço <= 0', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockVehicle })
        .mockResolvedValueOnce({ ...mockSeller })
        .mockResolvedValueOnce({ ...mockClient });

      const dto: CreateSaleDto = {
        ...baseDto,
        discount: { type: DiscountType.PERCENTAGE, value: 100 },
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o desconto em valor tornar o preço <= 0', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockVehicle })
        .mockResolvedValueOnce({ ...mockSeller })
        .mockResolvedValueOnce({ ...mockClient });

      const dto: CreateSaleDto = {
        ...baseDto,
        discount: { type: DiscountType.VALUE, value: 60000 },
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o cliente não tiver limite de crédito suficiente', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockVehicle })
        .mockResolvedValueOnce({ ...mockSeller })
        .mockResolvedValueOnce({ id: 'client-id', creditLimit: 20000 });

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('Caminho Feliz — Venda sem desconto', () => {
    it('deve efetuar a venda com sucesso, deduzir o saldo, alterar status e calcular comissão', async () => {
      const vehicle = { id: 'vehicle-id', status: 'AVAILABLE', price: 60000 };
      const seller = { id: 'seller-id', commissionRate: 5 };
      const client = { id: 'client-id', creditLimit: 100000 };

      mockEntityManager.findOne
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce(seller)
        .mockResolvedValueOnce(client);

      const result = await useCase.execute(baseDto);

      expect(mockDataSource.transaction).toHaveBeenCalled();

      // Verifica dedução do saldo
      expect(client.creditLimit).toBe(40000);

      // Verifica status do veículo
      expect(vehicle.status).toBe('SOLD');

      // Verifica valores da venda
      expect(result).toHaveProperty('amount', 60000);
      expect(result).toHaveProperty('status', 'COMPLETED');
      expect(result).toHaveProperty('discount_amount', 0);
      expect(result).toHaveProperty('commission_amount', 3000); // 60000 * 5%

      // Salva: venda, cliente, veículo, financiamento
      expect(mockEntityManager.save).toHaveBeenCalledTimes(4);
    });
  });

  describe('Caminho Feliz — Venda com desconto percentual', () => {
    it('deve aplicar desconto percentual corretamente e calcular a comissão sobre o preço final', async () => {
      const vehicle = { id: 'vehicle-id', status: 'AVAILABLE', price: 100000 };
      const seller = { id: 'seller-id', commissionRate: 10 };
      const client = { id: 'client-id', creditLimit: 200000 };

      mockEntityManager.findOne
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce(seller)
        .mockResolvedValueOnce(client);

      const dto: CreateSaleDto = {
        ...baseDto,
        discount: { type: DiscountType.PERCENTAGE, value: 20 }, // 20% de desconto
      };

      const result = await useCase.execute(dto);

      // Preço final: 100000 - (100000 * 20 / 100) = 80000
      expect(result).toHaveProperty('amount', 80000);
      expect(result).toHaveProperty('discount_amount', 20000);
      expect(result).toHaveProperty('commission_amount', 8000); // 80000 * 10%
      expect(result).toHaveProperty('status', 'COMPLETED');

      expect(client.creditLimit).toBe(120000); // 200000 - 80000
      expect(vehicle.status).toBe('SOLD');
    });
  });

  describe('Caminho Feliz — Venda com desconto em valor', () => {
    it('deve aplicar desconto em valor corretamente e calcular a comissão sobre o preço final', async () => {
      const vehicle = { id: 'vehicle-id', status: 'AVAILABLE', price: 50000 };
      const seller = { id: 'seller-id', commissionRate: 8 };
      const client = { id: 'client-id', creditLimit: 100000 };

      mockEntityManager.findOne
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce(seller)
        .mockResolvedValueOnce(client);

      const dto: CreateSaleDto = {
        ...baseDto,
        discount: { type: DiscountType.VALUE, value: 5000 }, // R$ 5000 de desconto
      };

      const result = await useCase.execute(dto);

      // Preço final: 50000 - 5000 = 45000
      expect(result).toHaveProperty('amount', 45000);
      expect(result).toHaveProperty('discount_amount', 5000);
      expect(result).toHaveProperty('commission_amount', 3600); // 45000 * 8%
      expect(result).toHaveProperty('status', 'COMPLETED');

      expect(client.creditLimit).toBe(55000); // 100000 - 45000
      expect(vehicle.status).toBe('SOLD');
    });
  });
});
