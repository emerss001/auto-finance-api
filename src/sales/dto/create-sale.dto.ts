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

class DiscountDto {
  @IsEnum(DiscountType, {
    message: 'O tipo de desconto deve ser PERCENTAGE ou VALUE',
  })
  type: DiscountType;

  @IsNumber({}, { message: 'O valor do desconto deve ser um número' })
  value: number;
}

export class CreateSaleDto {
  @IsUUID('4', { message: 'O ID do cliente deve ser um UUID válido' })
  client_id: string;

  @IsUUID('4', { message: 'O ID do veículo deve ser um UUID válido' })
  vehicle_id: string;

  @IsUUID('4', { message: 'O ID do vendedor deve ser um UUID válido' })
  seller_id: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;
}
