import { IsString, IsNotEmpty, Length, IsNumber, Min } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'O documento é obrigatório' })
  @Length(11, 14, {
    message: 'O documento deve ter entre 11 e 14 caracteres (CPF ou CNPJ)',
  })
  document: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'O limite de crédito não pode ser negativo' })
  creditLimit: number;
}
