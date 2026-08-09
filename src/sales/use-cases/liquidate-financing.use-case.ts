import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Financing } from '../entities/financings.entity';
import { Repository } from 'typeorm';
import { FinancingStatus } from '../enums/financing-status.enum';

@Injectable()
export class LiquidateFinancingUseCase {
  constructor(
    @InjectRepository(Financing)
    private readonly financingRepository: Repository<Financing>,
  ) {}

  async execute(financingId: string): Promise<Financing> {
    const financing = await this.financingRepository.findOne({
      where: { id: financingId },
    });

    if (!financing) {
      throw new NotFoundException('Financiamento não encontrado');
    }

    if (financing.status === FinancingStatus.LIQUIDATED) {
      throw new UnprocessableEntityException('Financiamento já liquidado');
    }

    if (financing.status === FinancingStatus.REJECTED) {
      throw new UnprocessableEntityException('Financiamento rejeitado');
    }

    financing.status = FinancingStatus.LIQUIDATED;
    financing.liquidatedAt = new Date();

    return await this.financingRepository.save(financing);
  }
}
