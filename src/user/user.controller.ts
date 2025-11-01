import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Login, Register } from './dto/create-user.dto';
import { AuthGuard } from './guard/auth.guard';
import { AuthRolesGuard } from './guard/auth-roles.guard';
import { Roles } from './decorator/user-role.decorator';
import { UserType } from '../utils/enum';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtPayloadType } from '../utils/types';
import { UpdateInfoUser } from './dto/update-user.dto';
import { AuthService } from './provider/auth.provider';

@Controller('api/user')
export class UserController {
    constructor(private readonly userService : UserService , private readonly authService : AuthService){}

    @Post('auth/register')
    public register(@Body() registerDto : Register){
        return this.userService.register(registerDto)
    }

    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() loginDto : Login){
        return this.userService.login(loginDto)
    }

    @Get('')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    public getUsers (){
        return this.userService.getUsers()
    }

    @Get('/current-user')
    @UseGuards(AuthGuard)
    public getUserById (@CurrentUser() payload : JwtPayloadType){
        return this.userService.getUserById(payload.id)
    }

    @Put('/update-user/me')
    @Roles(UserType.ADMIN , UserType.CLIENT)
    @UseGuards(AuthRolesGuard)
    public updateUserForMe(@CurrentUser() payload : JwtPayloadType , @Body() updateDto : UpdateInfoUser){
        return this.userService.updateUserById(payload.id , updateDto);
    }
    @Put('/update-user/:id')
    @Roles(UserType.ADMIN)
    @UseGuards(AuthRolesGuard)
    public updateUser(@Param('id', ParseIntPipe) id : string, @Body() updateDto : UpdateInfoUser){
        return this.userService.updateUserById(id , updateDto);
    }

    @Delete('/delete-user/:id')
    @Roles(UserType.ADMIN , UserType.CLIENT)
    @UseGuards(AuthRolesGuard)
    public deleteUser(@Param('id' , ParseIntPipe) id : string , @CurrentUser() payload : JwtPayloadType ){
        return this.userService.deleteUser(id , payload)
    }
}
