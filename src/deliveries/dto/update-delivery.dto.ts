import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { DeliveryStatus } from 'src/utils/delivery-enums';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryStatus, { message: 'حالة التوصيل غير صحيحة' })
  status?: DeliveryStatus;

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
