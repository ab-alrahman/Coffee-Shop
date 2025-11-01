import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator"
import { UserType } from "src/utils/enum"

export class Register {
    @IsString()
    @IsEmail()
    @Length(3,250)
    @IsNotEmpty()
    email : string
    @IsString()
    @Length(3,250)
    @IsNotEmpty()
    firstName : string
    @IsString()
    @Length(3,250)
    @IsNotEmpty()
    lastName : string
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password : string
    @IsOptional()
    @IsEnum(UserType, { message: 'userType must be one of: admin or client' })
    role?: UserType;
}


export class Login {
    @IsString()
    @IsEmail()
    @Length(3,250)
    @IsNotEmpty()
    @IsOptional()
    email ?: string
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password : string 
}
