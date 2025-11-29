import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OrderStatus } from 'src/utils/order-enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'حالة الطلب غير صحيحة' })
  status?: OrderStatus;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نص' })
  notes?: string;
}
