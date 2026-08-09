import { Financing } from '../entities/financings.entity';

export class FinancingListResponseDto {
  id: string;
  status: string;
  liquidatedAt: Date | null;
  saleAmount: number;
  clientName: string;
  clientDocument: string;
  vehicleModel: string;

  static fromEntity(financing: Financing): FinancingListResponseDto {
    return {
      id: financing.id,
      status: financing.status,
      liquidatedAt: financing.liquidatedAt,
      saleAmount: financing.sale?.amount,
      clientName: financing.sale?.client?.name,
      clientDocument: financing.sale?.client?.document,
      vehicleModel: financing.sale?.vehicle?.model,
    };
  }
}
