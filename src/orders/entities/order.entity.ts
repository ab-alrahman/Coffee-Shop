import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { OrderStatus } from 'src/utils/order-enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Delivery } from 'src/deliveries/entities/delivery.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number; // المبلغ الإجمالي

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; // ملاحظات العميل

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  addressId: string;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Address, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: true,
  })
  payment: Payment;

  @OneToOne(() => Delivery, (delivery) => delivery.order, {
    cascade: true,
  })
  delivery: Delivery;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
