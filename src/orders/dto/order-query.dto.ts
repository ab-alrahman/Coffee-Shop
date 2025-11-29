import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/utils/order-enums';

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'حالة الطلب غير صحيحة' })
  status?: OrderStatus;

  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
