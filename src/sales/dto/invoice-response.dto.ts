import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sale } from '../entities/sales.entity';

class InvoiceClientDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d' })
  id: string;

  @ApiProperty({ example: 'João da Silva' })
  name: string;

  @ApiProperty({ example: '12345678901' })
  document: string;
}

class InvoiceVehicleDto {
  @ApiProperty({ example: 'f1e2d3c4-b5a6-4a7b-8c9d-0e1f2a3b4c5d' })
  id: string;

  @ApiProperty({ example: 'Honda' })
  brand: string;

  @ApiProperty({ example: 'Civic' })
  model: string;

  @ApiProperty({ example: '1A2B3C4D5E6F7G8H9' })
  chassi: string;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' })
  invoiceId: string;

  @ApiProperty({ example: 120000 })
  amount: number;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ example: '2026-08-09T00:00:00.000Z' })
  date: Date;

  @ApiProperty({ type: InvoiceClientDto })
  client: InvoiceClientDto;

  @ApiProperty({ type: InvoiceVehicleDto })
  vehicle: InvoiceVehicleDto;

  static fromEntity(sale: Sale): InvoiceResponseDto {
    return {
      invoiceId: sale.id,
      amount: sale.amount,
      status: sale.status,
      date: sale.createdAt,
      client: {
        id: sale.client.id,
        name: sale.client.name,
        document: sale.client.document,
      },
      vehicle: {
        id: sale.vehicle.id,
        brand: sale.vehicle.brand,
        model: sale.vehicle.model,
        chassi: sale.vehicle.chassi,
      },
    };
  }
}
