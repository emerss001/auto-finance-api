import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';

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
  @ApiResponse({ status: 200, description: 'Lista de vendedores retornada com sucesso.' })
  async findAll() {
    return await this.sellersService.findAll();
  }
}
