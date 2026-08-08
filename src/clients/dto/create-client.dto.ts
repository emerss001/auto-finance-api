import { IsString, IsNotEmpty, Length, IsNumber, Min } from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'O documento deve ser um texto válido' })
  @IsNotEmpty({ message: 'O documento é obrigatório' })
  @Length(11, 14, {
    message: 'O documento deve ter entre 11 e 14 caracteres (CPF ou CNPJ)',
  })
  document: string;

  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsNumber({}, { message: 'O limite de crédito deve ser um número válido' })
  @Min(0, { message: 'O limite de crédito não pode ser negativo' })
  creditLimit: number;
}
