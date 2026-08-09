import { IsUUID } from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  client_id: string;

  @IsUUID()
  vehicle_id: string;
}
