import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { SalesService } from './sales.service';
import { SaleListResponseDto } from './dto/sale-list-response.dto';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly processVehicleSaleUseCase: ProcessVehicleSaleUseCase,
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

  @Get()
  async findAll() {
    const sales = await this.salesService.findAll();
    return sales.map((sale) => SaleListResponseDto.fromEntity(sale));
  }
}
