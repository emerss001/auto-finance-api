import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { numericTransformer } from '../../shared/transformers/numeric.transformer';

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  // Porcentagem de comissão (ex: 2.5 para 2,5%)
  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  commissionRate: number;
}
