import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty({ message: 'معرف المنتج مطلوب' })
  @IsUUID('4', { message: 'معرف المنتج غير صحيح' })
  productId: string;

  @IsNotEmpty({ message: 'الكمية مطلوبة' })
  @IsInt({ message: 'الكمية يجب أن تكون رقم صحيح' })
  @Min(1, { message: 'الكمية يجب أن تكون على الأقل 1' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'الحجم يجب أن يكون نص' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'التخصيصات يجب أن تكون نص' })
  customization?: string;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'معرف العنوان مطلوب' })
  @IsUUID('4', { message: 'معرف العنوان غير صحيح' })
  addressId: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نص' })
  notes?: string;

  @IsNotEmpty({ message: 'عناصر الطلب مطلوبة' })
  @IsArray({ message: 'عناصر الطلب يجب أن تكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
