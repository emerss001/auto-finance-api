import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Sale } from '../entities/sales.entity';
import { Vehicle } from '../../vehicles/entities/vehicles.entity';
import { VehicleStatus } from '../../vehicles/enums/vehicle-status.enum';
import { Client } from '../../clients/entities/clients.entity';
import { SaleStatus } from '../enums/sale-status.enum';
import { Financing } from '../entities/financings.entity';
import { FinancingStatus } from '../enums/financing-status.enum';
import { Seller } from '../../sellers/entities/sellers.entity';
import { CreateSaleDto, DiscountType } from '../dto/create-sale.dto';

@Injectable()
export class ProcessVehicleSaleUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(input: CreateSaleDto): Promise<Sale> {
    const { client_id, vehicle_id, seller_id, discount } = input;

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

      // 3 - buscar o vendedor
      const seller = await manager.findOne(Seller, {
        where: { id: seller_id },
      });

      if (!seller) {
        throw new NotFoundException('Vendedor não encontrado');
      }

      // 4 - buscar o cliente
      const client = await manager.findOne(Client, {
        where: { id: client_id },
      });

      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      // 5 - aplicar desconto, se houver
      let finalPrice = Number(vehicle.price);
      if (discount) {
        if (discount.type === DiscountType.PERCENTAGE) {
          finalPrice =
            Number(vehicle.price) -
            (Number(vehicle.price) * discount.value) / 100;
        } else if (discount.type === DiscountType.VALUE) {
          finalPrice = Number(vehicle.price) - discount.value;
        }
      }

      if (finalPrice <= 0) {
        throw new UnprocessableEntityException(
          'O desconto não pode ser maior ou igual ao preço do veículo',
        );
      }

      // 6 - validar a margem de crédito do cliente
      if (Number(client.creditLimit) < finalPrice) {
        throw new UnprocessableEntityException(
          'Limite de crédito insuficiente para esta transação.',
        );
      }

      // 7 - calcular comissão do vendedor
      const commissionAmount =
        finalPrice * (Number(seller.commissionRate) / 100);

      // 9 - efetuar a deduções
      client.creditLimit = Number(client.creditLimit) - finalPrice;
      vehicle.status = VehicleStatus.SOLD;

      // 10 - criar a venda e financiamento
      const monetaryDiscount = discount
        ? Number(vehicle.price) - finalPrice
        : 0;

      const sale = manager.create(Sale, {
        client,
        vehicle,
        seller,
        discount_amount: monetaryDiscount,
        commission_amount: commissionAmount,
        amount: finalPrice,
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
