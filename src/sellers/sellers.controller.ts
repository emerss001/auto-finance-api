import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { CommissionQueryDto } from './dto/commission-query.dto';
import { CommissionSummaryResponseDto } from './dto/commission-summary-response.dto';

@ApiTags('Vendedores')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo vendedor' })
  @ApiResponse({ status: 201, description: 'Vendedor criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  async create(@Body() createSellerDto: CreateSellerDto) {
    return await this.sellersService.create(createSellerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os vendedores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de vendedores retornada com sucesso.',
  })
  async findAll() {
    return await this.sellersService.findAll();
  }

  @Get(':id/commission')
  @ApiOperation({
    summary: 'Obter resumo de comissões de um vendedor por período',
  })
  @ApiParam({ name: 'id', description: 'ID do vendedor' })
  @ApiResponse({
    status: 200,
    description: 'Resumo de comissões retornado.',
    type: CommissionSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendedor não encontrado.' })
  @ApiResponse({ status: 400, description: 'Parâmetros de data inválidos.' })
  async getCommissionSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CommissionQueryDto,
  ) {
    return await this.sellersService.getCommissionSummary(
      id,
      query.startDate,
      query.endDate,
    );
  }
}
