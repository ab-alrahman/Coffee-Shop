import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/types/enum';

export class Register {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(3)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of: admin or client' })
  role?: Role;
}

export class Login {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
