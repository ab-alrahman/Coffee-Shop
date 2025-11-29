import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateInfoUser {
  @IsString()
  @Length(3, 250)
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;
  @IsString()
  @Length(3, 250)
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;
}
