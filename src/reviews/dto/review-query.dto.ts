import { IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ReviewQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'معرف المنتج غير صحيح' })
  productId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'التقييم يجب أن يكون رقم صحيح' })
  @Min(1, { message: 'التقييم يجب أن يكون على الأقل 1' })
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
