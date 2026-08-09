import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { Seller } from './entities/sellers.entity';
import { Sale } from '../sales/entities/sales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, Sale])],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
