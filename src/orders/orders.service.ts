import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { OrderStatus } from 'src/utils/order-enums';
import { UserType } from 'src/utils/enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // التحقق من وجود العنوان وأنه يخص المستخدم
    const address = await this.addressRepository.findOne({
      where: { id: createOrderDto.addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('العنوان غير موجود أو لا يخصك');
    }

    // حساب المبلغ الإجمالي والتحقق من المنتجات
    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`المنتج ${item.productId} غير موجود`);
      }

      if (!product.isAvailable) {
        throw new BadRequestException(
          `المنتج ${product.name} غير متوفر حالياً`,
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        customization: item.customization,
      });
    }

    try {
      // إنشاء الطلب
      const order = this.orderRepository.create({
        userId,
        addressId: createOrderDto.addressId,
        totalAmount,
        notes: createOrderDto.notes,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(order);

      // إنشاء عناصر الطلب
      const items = orderItems.map((item) =>
        this.orderItemRepository.create({
          ...item,
          orderId: savedOrder.id,
        }),
      );

      await this.orderItemRepository.save(items);

      // إرجاع الطلب مع العلاقات
      return await this.findOne(savedOrder.id, userId);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء الطلب');
    }
  }

  async findAll(
    queryDto: OrderQueryDto,
    userId?: string,
    userRole?: string,
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, userId: filterUserId } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('order.delivery', 'delivery');

    // إذا لم يكن أدمن، يعرض طلباته فقط
    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    // فلترة حسب المستخدم (للأدمن)
    if (filterUserId && userRole === UserType.ADMIN) {
      queryBuilder.andWhere('order.userId = :filterUserId', { filterUserId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC').skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  async findOne(
    id: string,
    userId?: string,
    userRole?: string,
  ): Promise<Order> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('order.delivery', 'delivery')
      .where('order.id = :id', { id });

    // إذا لم يكن أدمن، يتحقق أن الطلب يخصه
    if (userRole !== UserType.ADMIN && userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException(`الطلب بالمعرف ${id} غير موجود`);
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
    userRole?: string,
  ): Promise<Order> {
    const order = await this.findOne(id, userId, userRole);

    // التحقق من الصلاحية (فقط الأدمن يمكنه تغيير الحالة)
    if (userRole !== UserType.ADMIN) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل حالة الطلب');
    }

    Object.assign(order, updateOrderDto);

    try {
      return await this.orderRepository.save(order);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث الطلب');
    }
  }

  async cancel(
    id: string,
    userId: string,
    userRole?: string,
  ): Promise<Order> {
    const order = await this.findOne(id, userId, userRole);

    // التحقق من إمكانية الإلغاء
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('لا يمكن إلغاء هذا الطلب');
    }

    // العميل يمكنه إلغاء طلبه فقط إذا كان في حالة PENDING أو CONFIRMED
    if (
      userRole !== UserType.ADMIN &&
      ![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)
    ) {
      throw new BadRequestException('لا يمكن إلغاء الطلب في هذه المرحلة');
    }

    order.status = OrderStatus.CANCELLED;

    try {
      return await this.orderRepository.save(order);
    } catch (error) {
      throw new BadRequestException('فشل في إلغاء الطلب');
    }
  }

  async getStats(userId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    statusDistribution: { status: string; count: number }[];
  }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }

    const stats = await queryBuilder
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .getRawOne();

    const distributionQuery = this.orderRepository.createQueryBuilder('order');
    if (userId) {
      distributionQuery.where('order.userId = :userId', { userId });
    }

    const distribution = await distributionQuery
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return {
      totalOrders: parseInt(stats.totalOrders) || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      statusDistribution: distribution.map((d) => ({
        status: d.status,
        count: parseInt(d.count),
      })),
    };
  }
}
