import { Test, TestingModule } from '@nestjs/testing';
import { ProcessVehicleSaleUseCase } from './process-vehicle-sale.use-case';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('ProcessVehicleSaleUseCase', () => {
  let useCase: ProcessVehicleSaleUseCase;

  let mockEntityManager: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((entity, dto) => dto),
      save: jest.fn().mockImplementation((entity, data) => data || entity),
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

      await expect(useCase.execute('cliente-id', 'carro-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (ConflictException) se o veículo já estiver vendido', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce({
        id: 'carro-id',
        status: 'SOLD',
      });

      await expect(useCase.execute('cliente-id', 'carro-id')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve rejeitar (NotFoundException) se o cliente não for encontrado', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({
          id: 'carro-id',
          status: 'AVAILABLE',
          price: 50000,
        })
        .mockResolvedValueOnce(null);

      await expect(useCase.execute('cliente-id', 'carro-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (UnprocessableEntity) se o cliente não tiver limite de saldo suficiente', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({
          id: 'carro-id',
          status: 'AVAILABLE',
          price: 50000,
        })
        .mockResolvedValueOnce({ id: 'cliente-id', creditLimit: 20000 });

      await expect(useCase.execute('cliente-id', 'carro-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('Caminho Feliz (Sucesso)', () => {
    it('deve efetuar a venda com sucesso, deduzir o saldo e alterar o status', async () => {
      const mockCarro = { id: 'carro-id', status: 'AVAILABLE', price: 60000 };
      const mockCliente = { id: 'cliente-id', creditLimit: 100000 };

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockCarro)
        .mockResolvedValueOnce(mockCliente);

      const result = await useCase.execute('cliente-id', 'carro-id');

      expect(mockDataSource.transaction).toHaveBeenCalled();

      expect(mockCliente.creditLimit).toBe(40000);

      expect(mockCarro.status).toBe('SOLD');

      expect(mockEntityManager.save).toHaveBeenCalledTimes(4); // Salva: Cliente, Carro, Venda e Financiamento

      expect(result).toHaveProperty('amount', 60000);
      expect(result).toHaveProperty('status', 'COMPLETED');
    });
  });
});
