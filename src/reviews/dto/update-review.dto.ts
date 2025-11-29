import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional()
  @IsInt({ message: 'التقييم يجب أن يكون رقم صحيح' })
  @Min(1, { message: 'التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: 'التقييم يجب ألا يتجاوز 5' })
  rating?: number;

  @IsOptional()
  @IsString({ message: 'التعليق يجب أن يكون نص' })
  comment?: string;
}
