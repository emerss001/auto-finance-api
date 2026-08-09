import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { SalesService } from './sales.service';
import { SaleListResponseDto } from './dto/sale-list-response.dto';
import { LiquidateFinancingUseCase } from './use-cases/liquidate-financing.use-case';
import { FinancingListResponseDto } from './dto/financing-list-response.dto';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly processVehicleSaleUseCase: ProcessVehicleSaleUseCase,
    private readonly liquidateFinancingUseCase: LiquidateFinancingUseCase,
    private readonly salesService: SalesService,
  ) {}

  @Post('invoice')
  async invoiceVehicleSale(@Body() createSaleDto: CreateSaleDto) {
    const { client_id, vehicle_id } = createSaleDto;
    const sale = await this.processVehicleSaleUseCase.execute(
      client_id,
      vehicle_id,
    );
    return InvoiceResponseDto.fromEntity(sale);
  }

  @Patch('financings/:id/liquidate')
  async liquidateFinancing(@Param('id', ParseUUIDPipe) financingId: string) {
    const financing = await this.liquidateFinancingUseCase.execute(financingId);
    return financing;
  }

  @Get()
  async findAll() {
    const sales = await this.salesService.findAll();
    return sales.map((sale) => SaleListResponseDto.fromEntity(sale));
  }

  @Get('financings')
  async findAllFinancings() {
    const financings = await this.salesService.findAllFinancings();
    return financings.map((financing) =>
      FinancingListResponseDto.fromEntity(financing),
    );
  }
}
