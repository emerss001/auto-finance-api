import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './entities/sales.entity';
import { Financing } from './entities/financings.entity';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { LiquidateFinancingUseCase } from './use-cases/liquidate-financing.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Financing])],
  controllers: [SalesController],
  providers: [
    SalesService,
    ProcessVehicleSaleUseCase,
    LiquidateFinancingUseCase,
  ],
})
export class SalesModule {}
