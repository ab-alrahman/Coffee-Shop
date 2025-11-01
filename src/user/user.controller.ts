import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Login, Register } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRolesGuard } from 'src/common/guards/auth-roles.guard';
import { Roles } from 'src/common/decorator/user-role.decorator';
import { Role } from 'src/common/types/enum';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/register')
  register(@Body() registerDto: Register) {
    return this.userService.register(registerDto);
  }

  @Post('auth/login')
  login(@Body() loginDto: Login) {
    return this.userService.login(loginDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(Role.AMDIN)
  findAll() {
    return this.userService.findAllUsers();
  }

  @Get('/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(Role.AMDIN)
  findOne(@Param('userId') userId: string) {
    return this.userService.findOneUser(userId);
  }

  @Patch('/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(Role.AMDIN)
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('/:userId')
  @UseGuards(AuthRolesGuard)
  @Roles(Role.AMDIN)
  remove(@Param('userId') userId: string) {
    return this.userService.removeUser(userId);
  }
}
