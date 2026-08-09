import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Sale } from '../entities/sales.entity';
import { Vehicle } from 'src/vehicles/entities/vehicles.entity';
import { VehicleStatus } from 'src/vehicles/enums/vehicle-status.enum';
import { Client } from 'src/clients/entities/clients.entity';
import { SaleStatus } from '../enums/sale-status.enum';
import { Financing } from '../entities/financings.entity';
import { FinancingStatus } from '../enums/financing-status.enum';

@Injectable()
export class ProcessVehicleSaleUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(client_id: string, vehicle_id: string): Promise<Sale> {
    // 1 - abrir transação no banco de dados
    return await this.dataSource.transaction(async (manager) => {
      // 2 - buscar e bloquear o veículo para venda
      const vehicle = await manager.findOne(Vehicle, {
        where: { id: vehicle_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!vehicle) {
        throw new NotFoundException('Veículo não encontrado');
      }

      if (vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new ConflictException('Veículo não disponível para venda');
      }

      // 3 - buscar o cliente
      const client = await manager.findOne(Client, {
        where: { id: client_id },
      });

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      // 4 - validar a margem de crédito do cliente
      if (Number(client.creditLimit) < Number(vehicle.price)) {
        throw new UnprocessableEntityException(
          'Limite de crédito insuficiente para esta transação.',
        );
      }
      // 5 - efetuar a deduções
      client.creditLimit = Number(client.creditLimit) - Number(vehicle.price);
      vehicle.status = VehicleStatus.SOLD;

      // 6 - criar a venda e financiamento
      const sale = manager.create(Sale, {
        client,
        vehicle,
        amount: vehicle.price,
        status: SaleStatus.COMPLETED,
      });

      const savedSale = await manager.save(sale);

      const financing = manager.create(Financing, {
        sale: savedSale,
        status: FinancingStatus.PENDING,
      });

      await manager.save(Client, client);
      await manager.save(Vehicle, vehicle);
      await manager.save(Financing, financing);

      return savedSale;
    });
  }
}
