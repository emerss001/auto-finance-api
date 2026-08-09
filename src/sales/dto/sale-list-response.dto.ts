import { Sale } from '../entities/sales.entity';

export class SaleListResponseDto {
  id: string;
  amount: number;
  discountAmount: number;
  status: string;
  date: Date;
  clientName: string;
  clientDocument: string;
  vehicleModel: string;
  vehicleBrand: string;
  financingStatus?: string | null;

  static fromEntity(sale: Sale): SaleListResponseDto {
    return {
      id: sale.id,
      amount: sale.amount,
      discountAmount: sale.discount_amount || 0,
      status: sale.status,
      date: sale.createdAt,
      clientName: sale.client?.name,
      clientDocument: sale.client?.document,
      vehicleModel: sale.vehicle?.model,
      vehicleBrand: sale.vehicle?.brand,
      financingStatus: sale.financing?.status || null,
    };
  }
}
