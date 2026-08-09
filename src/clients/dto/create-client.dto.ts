import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsNumber, Min } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    description: 'Documento do cliente (CPF ou CNPJ)',
    example: '12345678901',
    minLength: 11,
    maxLength: 14,
  })
  @IsString({ message: 'O documento deve ser um texto válido' })
  @IsNotEmpty({ message: 'O documento é obrigatório' })
  @Length(11, 14, {
    message: 'O documento deve ter entre 11 e 14 caracteres (CPF ou CNPJ)',
  })
  document: string;

  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João da Silva',
  })
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Limite de crédito disponível para financiamento',
    example: 50000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'O limite de crédito deve ser um número válido' })
  @Min(0, { message: 'O limite de crédito não pode ser negativo' })
  creditLimit: number;
}
