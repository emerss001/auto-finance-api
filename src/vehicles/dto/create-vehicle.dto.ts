import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Chassi do veículo (17 caracteres)',
    example: '1A2B3C4D5E6F7G8H9',
    minLength: 17,
    maxLength: 17,
  })
  @IsString({ message: 'O chassi deve ser um texto válido' })
  @IsNotEmpty({ message: 'O chassi é obrigatório' })
  @Length(17, 17, { message: 'O chassi deve ter exatamente 17 caracteres' })
  chassi: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Honda',
  })
  @IsString({ message: 'A marca deve ser um texto válido' })
  @IsNotEmpty({ message: 'A marca é obrigatória' })
  brand: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Civic',
  })
  @IsString({ message: 'O modelo deve ser um texto válido' })
  @IsNotEmpty({ message: 'O modelo é obrigatório' })
  model: string;

  @ApiProperty({
    description: 'Ano de fabricação do veículo',
    example: 2024,
    minimum: 1900,
  })
  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(1900, { message: 'Ano inválido' })
  @Max(new Date().getFullYear() + 1, {
    message: 'O ano não pode ser maior que o próximo ano',
  })
  year: number;

  @ApiProperty({
    description: 'Preço do veículo',
    example: 120000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'O preço deve ser um número válido' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price: number;
}
