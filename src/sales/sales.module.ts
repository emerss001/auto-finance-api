import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './entities/sales.entity';
import { Financing } from './entities/financings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Financing])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
