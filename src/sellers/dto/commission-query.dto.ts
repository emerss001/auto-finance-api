import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class CommissionQueryDto {
  @ApiProperty({
    example: '2026-08-01',
    description: 'Data de início do período (ISO-8601)',
  })
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de início inválida' })
  startDate: Date;

  @ApiProperty({
    example: '2026-08-31',
    description: 'Data de fim do período (ISO-8601)',
  })
  @IsNotEmpty({ message: 'A data de fim é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de fim inválida' })
  endDate: Date;
}
