import { Sale } from '../entities/sales.entity';

export class InvoiceResponseDto {
  invoiceId: string;
  amount: number;
  status: string;
  date: Date;
  client: {
    id: string;
    name: string;
    document: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    chassi: string;
  };

  static fromEntity(sale: Sale): InvoiceResponseDto {
    return {
      invoiceId: sale.id,
      amount: sale.amount,
      status: sale.status,
      date: sale.createdAt,
      client: {
        id: sale.client.id,
        name: sale.client.name,
        document: sale.client.document,
      },
      vehicle: {
        id: sale.vehicle.id,
        brand: sale.vehicle.brand,
        model: sale.vehicle.model,
        chassi: sale.vehicle.chassi,
      },
    };
  }
}
