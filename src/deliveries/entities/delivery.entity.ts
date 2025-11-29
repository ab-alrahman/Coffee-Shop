import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { DeliveryStatus } from 'src/utils/delivery-enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({ nullable: true })
  driverName: string; // اسم السائق

  @Column({ nullable: true })
  driverPhone: string; // رقم هاتف السائق

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryTime: Date; // الوقت المتوقع للتوصيل

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryTime: Date; // الوقت الفعلي للتوصيل

  @Column({ type: 'text', nullable: true })
  notes: string; // ملاحظات التوصيل

  @Column({ nullable: false })
  orderId: string;

  @OneToOne(() => Order, (order) => order.delivery, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
