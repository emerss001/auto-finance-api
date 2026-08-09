import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Financing } from '../entities/financings.entity';

export class FinancingListResponseDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f' })
  id: string;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiPropertyOptional({ example: '2026-08-09T00:00:00.000Z', nullable: true })
  liquidatedAt: Date | null;

  @ApiProperty({ example: 120000 })
  saleAmount: number;

  @ApiProperty({ example: 'João da Silva' })
  clientName: string;

  @ApiProperty({ example: '12345678901' })
  clientDocument: string;

  @ApiProperty({ example: 'Civic' })
  vehicleModel: string;

  static fromEntity(financing: Financing): FinancingListResponseDto {
    return {
      id: financing.id,
      status: financing.status,
      liquidatedAt: financing.liquidatedAt,
      saleAmount: financing.sale?.amount,
      clientName: financing.sale?.client?.name,
      clientDocument: financing.sale?.client?.document,
      vehicleModel: financing.sale?.vehicle?.model,
    };
  }
}
