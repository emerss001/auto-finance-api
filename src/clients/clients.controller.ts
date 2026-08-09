import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clientes')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'Já existe um cliente com este documento.' })
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
  async findAll() {
    return await this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID (UUID) do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.clientsService.findOne(id);
  }
}
