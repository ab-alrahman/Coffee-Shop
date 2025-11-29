import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Delivery } from './entities/delivery.entity';
import { Order } from 'src/orders/entities/order.entity';
import { DeliveryStatus } from 'src/utils/delivery-enums';
import { UserType } from 'src/utils/enum';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    // التحقق من وجود الطلب
    const order = await this.orderRepository.findOne({
      where: { id: createDeliveryDto.orderId },
    });

    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // التحقق من عدم وجود توصيل سابق
    const existingDelivery = await this.deliveryRepository.findOne({
      where: { orderId: createDeliveryDto.orderId },
    });

    if (existingDelivery) {
      throw new BadRequestException('تم إنشاء توصيل لهذا الطلب مسبقاً');
    }

    try {
      const delivery = this.deliveryRepository.create({
        ...createDeliveryDto,
        status: DeliveryStatus.PENDING,
      });

      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء التوصيل');
    }
  }

  async findAll(userId?: string): Promise<Delivery[]> {
    const queryBuilder = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address');

    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }

    return await queryBuilder.orderBy('delivery.createdAt', 'DESC').getMany();
  }

  async findOne(
    id: string,
    userId?: string,
    userRole?: UserType,
  ): Promise<Delivery> {
    const queryBuilder = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .where('delivery.id = :id', { id });

    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const delivery = await queryBuilder.getOne();

    if (!delivery) {
      throw new NotFoundException(`التوصيل بالمعرف ${id} غير موجود`);
    }

    return delivery;
  }

  async findByOrder(
    orderId: string,
    userId: string,
    userRole: string,
  ): Promise<Delivery> {
    const queryBuilder = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.address', 'address')
      .where('delivery.orderId = :orderId', { orderId });

    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const delivery = await queryBuilder.getOne();

    if (!delivery) {
      throw new NotFoundException(`التوصيل للطلب ${orderId} غير موجود`);
    }

    return delivery;
  }

  async update(
    id: string,
    updateDeliveryDto: UpdateDeliveryDto,
    userRole: UserType,
  ): Promise<Delivery> {
    if (userRole !== UserType.ADMIN) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل التوصيل');
    }

    const delivery = await this.findOne(id);

    // إذا تم تحديث الحالة إلى DELIVERED، قم بتسجيل الوقت الفعلي
    if (
      updateDeliveryDto.status === DeliveryStatus.DELIVERED &&
      delivery.status !== DeliveryStatus.DELIVERED
    ) {
      delivery.actualDeliveryTime = new Date();
    }

    Object.assign(delivery, updateDeliveryDto);

    try {
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث التوصيل');
    }
  }

  async assignDriver(
    id: string,
    driverName: string,
    driverPhone: string,
    userRole: UserType,
  ): Promise<Delivery> {
    if (userRole !== UserType.ADMIN) {
      throw new ForbiddenException('ليس لديك صلاحية لتعيين سائق');
    }

    const delivery = await this.findOne(id);

    delivery.driverName = driverName;
    delivery.driverPhone = driverPhone;
    delivery.status = DeliveryStatus.ASSIGNED;

    try {
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException('فشل في تعيين السائق');
    }
  }

  async updateStatus(
    id: string,
    status: DeliveryStatus,
    userRole: UserType,
  ): Promise<Delivery> {
    return this.update(id, { status }, userRole);
  }
}
