import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateDeliveryDto {
  @IsNotEmpty({ message: 'معرف الطلب مطلوب' })
  @IsUUID('4', { message: 'معرف الطلب غير صحيح' })
  orderId: string;

  @IsOptional()
  @IsString({ message: 'اسم السائق يجب أن يكون نص' })
  driverName?: string;

  @IsOptional()
  @IsString({ message: 'رقم هاتف السائق يجب أن يكون نص' })
  driverPhone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'الوقت المتوقع للتوصيل غير صحيح' })
  estimatedDeliveryTime?: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نص' })
  notes?: string;
}
