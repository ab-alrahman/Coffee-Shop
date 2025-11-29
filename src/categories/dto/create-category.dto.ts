import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100, { message: 'اسم الفئة يجب أن يكون بين 1 و 100 حرف' })
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'الوصف يجب أن يكون أقل من 500 حرف' })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;
}
