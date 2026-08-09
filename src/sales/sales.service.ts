import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sales.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

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
