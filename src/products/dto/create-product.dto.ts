import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Length,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100, { message: 'اسم المنتج يجب أن يكون بين 1 و 100 حرف' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500, { message: 'الوصف يجب أن يكون بين 1 و 500 حرف' })
  description: string;

  @IsNumber()
  @Min(0, { message: 'السعر يجب أن يكون أكبر من أو يساوي 0' })
  @Transform(({ value }) => Number(value))
  price: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف الفئة يجب أن يكون UUID صالح' })
  categoryId?: string;
}
