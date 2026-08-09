import { Body, Controller, Post } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { InvoiceResponseDto } from './dto/invoice-response.dto';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly processVehicleSaleUseCase: ProcessVehicleSaleUseCase,
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
}
