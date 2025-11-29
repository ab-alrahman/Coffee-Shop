import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'التقييم مطلوب' })
  @IsInt({ message: 'التقييم يجب أن يكون رقم صحيح' })
  @Min(1, { message: 'التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: 'التقييم يجب ألا يتجاوز 5' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'التعليق يجب أن يكون نص' })
  comment?: string;

  @IsNotEmpty({ message: 'معرف المنتج مطلوب' })
  @IsUUID('4', { message: 'معرف المنتج غير صحيح' })
  productId: string;
}
