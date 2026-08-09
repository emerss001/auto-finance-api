import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FinancingStatus } from '../enums/financing-status.enum';
import { Sale } from './sales.entity';

@Entity('financings')
export class Financing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Sale, (sale) => sale.financing)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'sale_id', type: 'uuid', unique: true })
  saleId: string;

  @Column({
    type: 'enum',
    enum: FinancingStatus,
    default: FinancingStatus.PENDING,
  })
  status: FinancingStatus;

  @Column({ name: 'liquidated_at', type: 'timestamp', nullable: true })
  liquidatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
