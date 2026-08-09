import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/sellers.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { Sale } from '../sales/entities/sales.entity';
import { Between } from 'typeorm';
import { CommissionSummaryResponseDto } from './dto/commission-summary-response.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellersRepository: Repository<Seller>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
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

  async getCommissionSummary(
    sellerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CommissionSummaryResponseDto> {
    const seller = await this.sellersRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado');
    }

    // Ajustar a data de término para o final do dia
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        sellerId: sellerId,
        createdAt: Between(startDate, endOfDay),
      },
    });

    const totalSales = sales.length;
    const totalCommission = sales.reduce(
      (sum, sale) => sum + Number(sale.commission_amount || 0),
      0,
    );

    return {
      totalSales,
      totalCommission,
    };
  }
}
