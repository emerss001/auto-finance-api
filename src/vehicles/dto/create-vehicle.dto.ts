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
  @IsString({ message: 'O chassi deve ser um texto válido' })
  @IsNotEmpty({ message: 'O chassi é obrigatório' })
  @Length(17, 17, { message: 'O chassi deve ter exatamente 17 caracteres' })
  chassi: string;

  @IsString({ message: 'A marca deve ser um texto válido' })
  @IsNotEmpty({ message: 'A marca é obrigatória' })
  brand: string;

  @IsString({ message: 'O modelo deve ser um texto válido' })
  @IsNotEmpty({ message: 'O modelo é obrigatório' })
  model: string;

  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(1900, { message: 'Ano inválido' })
  @Max(new Date().getFullYear() + 1, {
    message: 'O ano não pode ser maior que o próximo ano',
  })
  year: number;

  @IsNumber({}, { message: 'O preço deve ser um número válido' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price: number;
}
