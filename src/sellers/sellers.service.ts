import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/sellers.entity';
import { CreateSellerDto } from './dto/create-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellersRepository: Repository<Seller>,
  ) {}

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    const seller = this.sellersRepository.create({
      name: createSellerDto.name,
      commissionRate: createSellerDto.commissionRate,
    });
    
    return await this.sellersRepository.save(seller);
  }

  async findAll(): Promise<Seller[]> {
    return await this.sellersRepository.find();
  }
}
