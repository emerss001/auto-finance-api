import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSellerDto {
  @ApiProperty({
    description: 'Nome completo do vendedor',
    example: 'Carlos Mendes',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Taxa de comissão do vendedor (em porcentagem)',
    example: 5.5,
    minimum: 0,
  })
  @IsNumber({}, { message: 'A taxa de comissão deve ser um número' })
  @Min(0, { message: 'A taxa de comissão não pode ser negativa' })
  @IsNotEmpty({ message: 'A taxa de comissão é obrigatória' })
  commissionRate: number;
}
