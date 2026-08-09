import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sales.entity';
import { Financing } from './entities/financings.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Financing)
    private readonly financingsRepository: Repository<Financing>,
  ) {}

  async findAllFinancings(): Promise<Financing[]> {
    return await this.financingsRepository.find({
      relations: {
        sale: {
          client: true,
          vehicle: true,
        },
      },
    });
  }

  async findAll(): Promise<Sale[]> {
    return await this.salesRepository.find({
      relations: {
        client: true,
        vehicle: true,
        financing: true,
      },
    });
  }
}
