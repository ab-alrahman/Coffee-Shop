import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { PaymentStatus } from 'src/utils/order-enums';
import { UserType } from 'src/utils/enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // التحقق من وجود الطلب وأنه يخص المستخدم
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('الطلب غير موجود أو لا يخصك');
    }

    // التحقق من عدم وجود دفعة سابقة
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId: createPaymentDto.orderId },
    });

    if (existingPayment) {
      throw new BadRequestException('تم إنشاء دفعة لهذا الطلب مسبقاً');
    }

    try {
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
      });

      return await this.paymentRepository.save(payment);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء الدفعة');
    }
  }

  async findAll(userId?: string): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.user', 'user');

    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }

    return await queryBuilder.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async findOne(
    id: string,
    userId?: string,
    userRole?: UserType,
  ): Promise<Payment> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .where('payment.id = :id', { id });

    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const payment = await queryBuilder.getOne();

    if (!payment) {
      throw new NotFoundException(`الدفعة بالمعرف ${id} غير موجودة`);
    }

    return payment;
  }

  async findByOrder(
    orderId: string,
    userId?: string,
    userRole?: UserType,
  ): Promise<Payment> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('payment.orderId = :orderId', { orderId });

    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const payment = await queryBuilder.getOne();

    if (!payment) {
      throw new NotFoundException(`الدفعة للطلب ${orderId} غير موجودة`);
    }

    return payment;
  }

  async updateStatus(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    userRole: UserType,
  ): Promise<Payment> {
    if (userRole !== UserType.ADMIN) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل حالة الدفع');
    }

    const payment = await this.findOne(id);

    Object.assign(payment, updatePaymentDto);

    try {
      return await this.paymentRepository.save(payment);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث الدفعة');
    }
  }

  async confirmPayment(id: string, userRole: UserType): Promise<Payment> {
    return this.updateStatus(id, { status: PaymentStatus.PAID }, userRole);
  }
}
