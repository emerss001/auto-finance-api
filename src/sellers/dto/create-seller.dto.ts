import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSellerDto {
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsNumber({}, { message: 'A taxa de comissão deve ser um número' })
  @Min(0, { message: 'A taxa de comissão não pode ser negativa' })
  @IsNotEmpty({ message: 'A taxa de comissão é obrigatória' })
  commissionRate: number;
}
