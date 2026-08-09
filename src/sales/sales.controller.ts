import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessVehicleSaleUseCase } from './use-cases/process-vehicle-sale.use-case';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { SalesService } from './sales.service';
import { SaleListResponseDto } from './dto/sale-list-response.dto';
import { LiquidateFinancingUseCase } from './use-cases/liquidate-financing.use-case';
import { RejectFinancingUseCase } from './use-cases/reject-financing.use-case';
import { FinancingListResponseDto } from './dto/financing-list-response.dto';

@ApiTags('Vendas')
@Controller('sales')
export class SalesController {
  constructor(
    private readonly processVehicleSaleUseCase: ProcessVehicleSaleUseCase,
    private readonly liquidateFinancingUseCase: LiquidateFinancingUseCase,
    private readonly rejectFinancingUseCase: RejectFinancingUseCase,
    private readonly salesService: SalesService,
  ) {}

  @Post('invoice')
  @ApiOperation({ summary: 'Faturar a venda de um veículo' })
  @ApiResponse({
    status: 201,
    description: 'Venda faturada com sucesso.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Cliente, veículo ou vendedor não encontrado.' })
  @ApiResponse({ status: 409, description: 'Veículo já vendido.' })
  @ApiResponse({ status: 422, description: 'Limite de crédito insuficiente ou desconto inválido.' })
  async invoiceVehicleSale(@Body() createSaleDto: CreateSaleDto) {
    const sale = await this.processVehicleSaleUseCase.execute(createSaleDto);
    return InvoiceResponseDto.fromEntity(sale);
  }

  @ApiTags('Financiamentos')
  @Patch('financings/:id/liquidate')
  @ApiOperation({ summary: 'Liquidar um financiamento pendente' })
  @ApiParam({ name: 'id', description: 'ID (UUID) do financiamento' })
  @ApiResponse({ status: 200, description: 'Financiamento liquidado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Financiamento não encontrado.' })
  @ApiResponse({ status: 422, description: 'Financiamento já liquidado ou rejeitado.' })
  async liquidateFinancing(@Param('id', ParseUUIDPipe) financingId: string) {
    const financing = await this.liquidateFinancingUseCase.execute(financingId);
    return financing;
  }

  @ApiTags('Financiamentos')
  @Patch('financings/:id/reject')
  @ApiOperation({ summary: 'Rejeitar um financiamento e cancelar a venda' })
  @ApiParam({ name: 'id', description: 'ID (UUID) do financiamento' })
  @ApiResponse({ status: 200, description: 'Financiamento rejeitado com sucesso. Venda cancelada.' })
  @ApiResponse({ status: 404, description: 'Financiamento não encontrado.' })
  @ApiResponse({ status: 422, description: 'Financiamento já liquidado ou rejeitado.' })
  async rejectFinancing(@Param('id', ParseUUIDPipe) financingId: string) {
    const financing = await this.rejectFinancingUseCase.execute(financingId);
    return financing;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as vendas faturadas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vendas retornada com sucesso.',
    type: [SaleListResponseDto],
  })
  async findAll() {
    const sales = await this.salesService.findAll();
    return sales.map((sale) => SaleListResponseDto.fromEntity(sale));
  }

  @ApiTags('Financiamentos')
  @Get('financings')
  @ApiOperation({ summary: 'Listar todos os financiamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de financiamentos retornada com sucesso.',
    type: [FinancingListResponseDto],
  })
  async findAllFinancings() {
    const financings = await this.salesService.findAllFinancings();
    return financings.map((financing) =>
      FinancingListResponseDto.fromEntity(financing),
    );
  }
}
