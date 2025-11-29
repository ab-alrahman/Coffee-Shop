import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { PaymentMethod } from 'src/utils/order-enums';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'معرف الطلب مطلوب' })
  @IsUUID('4', { message: 'معرف الطلب غير صحيح' })
  orderId: string;

  @IsNotEmpty({ message: 'طريقة الدفع مطلوبة' })
  @IsEnum(PaymentMethod, { message: 'طريقة الدفع غير صحيحة' })
  method: PaymentMethod;

  @IsOptional()
  @IsString({ message: 'معرف العملية يجب أن يكون نص' })
  transactionId?: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نص' })
  notes?: string;
}
