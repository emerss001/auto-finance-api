import { Test, TestingModule } from '@nestjs/testing';
import { RejectFinancingUseCase } from './reject-financing.use-case';
import { DataSource } from 'typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FinancingStatus } from '../enums/financing-status.enum';
import { SaleStatus } from '../enums/sale-status.enum';
import { VehicleStatus } from '../../vehicles/enums/vehicle-status.enum';

describe('RejectFinancingUseCase', () => {
  let useCase: RejectFinancingUseCase;

  let mockEntityManager: any;
  let mockDataSource: any;

  const mockFinancing = {
    id: 'fin-id',
    status: FinancingStatus.PENDING,
    saleId: 'sale-id',
  };

  const mockSale = {
    id: 'sale-id',
    status: SaleStatus.COMPLETED,
    clientId: 'client-id',
    vehicleId: 'vehicle-id',
    amount: 60000,
  };

  const mockClient = {
    id: 'client-id',
    creditLimit: 40000,
  };

  const mockVehicle = {
    id: 'vehicle-id',
    status: VehicleStatus.SOLD,
  };

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((_entity, data) => data || _entity),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return await cb(mockEntityManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectFinancingUseCase,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    useCase = module.get<RejectFinancingUseCase>(RejectFinancingUseCase);
  });

  describe('Caminhos de Falha (Regras de Negócio)', () => {
    it('deve rejeitar (NotFoundException) se o financiamento não for encontrado', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o financiamento já estiver liquidado', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce({
        id: 'fin-id',
        status: FinancingStatus.LIQUIDATED,
      });

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o financiamento já estiver rejeitado', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce({
        id: 'fin-id',
        status: FinancingStatus.REJECTED,
      });

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se a venda associada não for encontrada', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockFinancing })
        .mockResolvedValueOnce(null); // sale not found

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se a venda já estiver cancelada', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockFinancing })
        .mockResolvedValueOnce({
          ...mockSale,
          status: SaleStatus.CANCELED,
        });

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o cliente associado não for encontrado', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockFinancing })
        .mockResolvedValueOnce({ ...mockSale })
        .mockResolvedValueOnce(null); // client not found

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o veículo associado não for encontrado', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ ...mockFinancing })
        .mockResolvedValueOnce({ ...mockSale })
        .mockResolvedValueOnce({ ...mockClient })
        .mockResolvedValueOnce(null); // vehicle not found

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('Caminho Feliz (Sucesso)', () => {
    it('deve rejeitar o financiamento com sucesso, restaurar saldo e liberar veículo', async () => {
      const financing = { ...mockFinancing };
      const sale = { ...mockSale };
      const client = { ...mockClient };
      const vehicle = { ...mockVehicle };

      mockEntityManager.findOne
        .mockResolvedValueOnce(financing)
        .mockResolvedValueOnce(sale)
        .mockResolvedValueOnce(client)
        .mockResolvedValueOnce(vehicle);

      const result = await useCase.execute('fin-id');

      expect(mockDataSource.transaction).toHaveBeenCalled();

      // Verifica restauração do saldo do cliente (40000 + 60000 = 100000)
      expect(client.creditLimit).toBe(100000);

      // Verifica que o veículo voltou a ficar disponível
      expect(vehicle.status).toBe(VehicleStatus.AVAILABLE);

      // Verifica status do financiamento e da venda
      expect(financing.status).toBe(FinancingStatus.REJECTED);
      expect(sale.status).toBe(SaleStatus.CANCELED);

      // Salva: cliente, veículo, venda, financiamento
      expect(mockEntityManager.save).toHaveBeenCalledTimes(4);

      // Verifica retorno
      expect(result.status).toBe(FinancingStatus.REJECTED);
    });
  });
});
