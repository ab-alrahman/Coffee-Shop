import { IsOptional, IsEnum } from 'class-validator';
import { PaymentStatus } from 'src/utils/order-enums';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'حالة الدفع غير صحيحة' })
  status?: PaymentStatus;
}
