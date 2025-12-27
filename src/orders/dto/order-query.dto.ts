import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from 'src/utils/order-enums';

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'حالة الطلب غير صحيحة' })
  status?: OrderStatus;

  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  userId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxTotal?: number;
}
