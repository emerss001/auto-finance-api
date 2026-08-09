import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LiquidateFinancingUseCase } from './liquidate-financing.use-case';
import { Financing } from '../entities/financings.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FinancingStatus } from '../enums/financing-status.enum';

describe('LiquidateFinancingUseCase', () => {
  let useCase: LiquidateFinancingUseCase;
  let mockFinancingRepository: any;

  beforeEach(async () => {
    mockFinancingRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiquidateFinancingUseCase,
        {
          provide: getRepositoryToken(Financing), // Injeta o mock no lugar do Repository<Financing>
          useValue: mockFinancingRepository,
        },
      ],
    }).compile();

    useCase = module.get<LiquidateFinancingUseCase>(LiquidateFinancingUseCase);
  });

  describe('Caminhos de Falha (Regras de Negócio)', () => {
    it('deve rejeitar (NotFoundException) se o financiamento não for encontrado', async () => {
      mockFinancingRepository.findOne.mockResolvedValueOnce(null);

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o financiamento já estiver liquidado', async () => {
      mockFinancingRepository.findOne.mockResolvedValueOnce({
        id: 'fin-id',
        status: FinancingStatus.LIQUIDATED,
      });

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('deve rejeitar (UnprocessableEntityException) se o financiamento estiver rejeitado', async () => {
      mockFinancingRepository.findOne.mockResolvedValueOnce({
        id: 'fin-id',
        status: FinancingStatus.REJECTED,
      });

      await expect(useCase.execute('fin-id')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('Caminho Feliz (Sucesso)', () => {
    it('deve liquidar o financiamento com sucesso', async () => {
      const mockFinancing = {
        id: 'fin-id',
        status: FinancingStatus.PENDING,
        liquidatedAt: null,
      };

      mockFinancingRepository.findOne.mockResolvedValueOnce(mockFinancing);

      const result = await useCase.execute('fin-id');

      expect(mockFinancing.status).toBe(FinancingStatus.LIQUIDATED);

      expect(mockFinancing.liquidatedAt).toBeInstanceOf(Date);

      expect(mockFinancingRepository.save).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(FinancingStatus.LIQUIDATED);
      expect(result.liquidatedAt).toBeInstanceOf(Date);
    });
  });
});
