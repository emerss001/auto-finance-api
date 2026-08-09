import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { numericTransformer } from '../../shared/transformers/numeric.transformer';
import { SaleStatus } from '../enums/sale-status.enum';
import { Client } from '../../clients/entities/clients.entity';
import { Vehicle } from '../../vehicles/entities/vehicles.entity';
import { Financing } from './financings.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Financing, (financing) => financing.sale)
  financing: Financing;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @OneToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'vehicle_id', type: 'uuid', unique: true })
  vehicleId: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    transformer: numericTransformer,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
