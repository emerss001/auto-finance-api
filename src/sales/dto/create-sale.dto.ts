import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  VALUE = 'VALUE',
}

export class DiscountDto {
  @ApiProperty({
    description: 'Tipo de desconto aplicado (PERCENTAGE ou VALUE)',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType, {
    message: 'O tipo de desconto deve ser PERCENTAGE ou VALUE',
  })
  type: DiscountType;

  @ApiProperty({
    description: 'Valor do desconto (percentual ou absoluto)',
    example: 10,
  })
  @IsNumber({}, { message: 'O valor do desconto deve ser um número' })
  value: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'ID do cliente (UUID v4)',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'O ID do cliente deve ser um UUID válido' })
  client_id: string;

  @ApiProperty({
    description: 'ID do veículo (UUID v4)',
    example: 'f1e2d3c4-b5a6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'O ID do veículo deve ser um UUID válido' })
  vehicle_id: string;

  @ApiProperty({
    description: 'ID do vendedor (UUID v4)',
    example: 'c3b2a1d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'O ID do vendedor deve ser um UUID válido' })
  seller_id: string;

  @ApiPropertyOptional({
    description: 'Desconto aplicado à venda (opcional)',
    type: () => DiscountDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;
}
