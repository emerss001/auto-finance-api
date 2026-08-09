import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Financing } from '../entities/financings.entity';
import { Sale } from '../entities/sales.entity';
import { Vehicle } from '../../vehicles/entities/vehicles.entity';
import { Client } from '../../clients/entities/clients.entity';

import { FinancingStatus } from '../enums/financing-status.enum';
import { SaleStatus } from '../enums/sale-status.enum';
import { VehicleStatus } from '../../vehicles/enums/vehicle-status.enum';

@Injectable()
export class RejectFinancingUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(financingId: string): Promise<Financing> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Buscar financiamento
      const financing = await manager.findOne(Financing, {
        where: { id: financingId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!financing) {
        throw new NotFoundException('Financiamento não encontrado');
      }

      if (financing.status !== FinancingStatus.PENDING) {
        throw new UnprocessableEntityException(
          `Não é possível rejeitar um financiamento que está com status ${financing.status}`,
        );
      }

      // Buscar a venda
      const sale = await manager.findOne(Sale, {
        where: { id: financing.saleId },
        lock: { mode: 'pessimistic_write' },
      });

      // Validação de segurança extra
      if (!sale) {
        throw new UnprocessableEntityException(
          'Venda associada não encontrada',
        );
      }

      if (sale.status === SaleStatus.CANCELED) {
        throw new UnprocessableEntityException('A venda já está cancelada');
      }

      // Buscar as entidades relacionadas e travá-las também
      const client = await manager.findOne(Client, {
        where: { id: sale.clientId },
        lock: { mode: 'pessimistic_write' },
      });

      if (client?.id !== sale.clientId) {
        throw new UnprocessableEntityException(
          'Cliente associado não corresponde à venda',
        );
      }

      if (!client) {
        throw new UnprocessableEntityException(
          'Cliente associado não encontrado',
        );
      }

      const vehicle = await manager.findOne(Vehicle, {
        where: { id: sale.vehicleId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!vehicle) {
        throw new UnprocessableEntityException(
          'Veículo associado não encontrado',
        );
      }

      // 2. Reverter Saldo do Cliente
      client.creditLimit = Number(client.creditLimit) + Number(sale.amount);

      // 4. Reverter Veículo
      vehicle.status = VehicleStatus.AVAILABLE;

      // 5. Atualizar Status do Financiamento e Venda
      financing.status = FinancingStatus.REJECTED;
      sale.status = SaleStatus.CANCELED;

      // 6. Persistir as alterações
      await manager.save(Client, client);

      await manager.save(Vehicle, vehicle);
      await manager.save(Sale, sale);

      return await manager.save(Financing, financing);
    });
  }
}
