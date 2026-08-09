import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sale } from '../entities/sales.entity';

export class SaleListResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' })
  id: string;

  @ApiProperty({ example: 120000 })
  amount: number;

  @ApiProperty({ example: 5000 })
  discountAmount: number;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ example: '2026-08-09T00:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 'João da Silva' })
  clientName: string;

  @ApiProperty({ example: '12345678901' })
  clientDocument: string;

  @ApiProperty({ example: 'Civic' })
  vehicleModel: string;

  @ApiProperty({ example: 'Honda' })
  vehicleBrand: string;

  @ApiPropertyOptional({ example: 'PENDING', nullable: true })
  financingStatus?: string | null;

  static fromEntity(sale: Sale): SaleListResponseDto {
    return {
      id: sale.id,
      amount: sale.amount,
      discountAmount: sale.discount_amount || 0,
      status: sale.status,
      date: sale.createdAt,
      clientName: sale.client?.name,
      clientDocument: sale.client?.document,
      vehicleModel: sale.vehicle?.model,
      vehicleBrand: sale.vehicle?.brand,
      financingStatus: sale.financing?.status || null,
    };
  }
}
