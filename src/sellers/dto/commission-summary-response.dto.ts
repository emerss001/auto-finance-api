import { ApiProperty } from '@nestjs/swagger';

export class CommissionSummaryResponseDto {
  @ApiProperty({
    example: 10,
    description: 'Número total de vendas realizadas no período',
  })
  totalSales: number;

  @ApiProperty({
    example: 5500.5,
    description: 'Valor total de comissões recebidas no período',
  })
  totalCommission: number;
}
