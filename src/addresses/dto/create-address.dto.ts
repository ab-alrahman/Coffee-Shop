import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @IsString({ message: 'العنوان يجب أن يكون نص' })
  address: string;

  @IsNotEmpty({ message: 'المدينة مطلوبة' })
  @IsString({ message: 'المدينة يجب أن تكون نص' })
  city: string;

  @IsOptional()
  @IsString({ message: 'الدولة يجب أن تكون نص' })
  country?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault يجب أن يكون قيمة منطقية' })
  isDefault?: boolean;
}
