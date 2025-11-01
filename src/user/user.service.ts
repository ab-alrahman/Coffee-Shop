import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Login, Register } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayloadType } from 'src/common/types/type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userRepo: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: Register) {
    const { email, password, name, role } = registerDto;
    const userFromDB = await this.userRepo.findOne({ email: email });
    if (userFromDB) {
      throw new HttpException('User is already exist', 400);
    }

    const salt: number = 10;
    const passwordHash = await bcrypt.hash(password, salt);
    const newUserRegister = await this.userRepo.create({
      name,
      email,
      password: passwordHash,
      role,
    });
    const accessToken = await this.generateToken({
      id: newUserRegister.id,
      sub: newUserRegister.name,
      role: newUserRegister.role,
    });
    return {
      accessToken,
      success: true,
      user: newUserRegister,
    };
  }

  async login(loginDto: Login) {
    const { password, email } = loginDto;
    const userFound = await this.userRepo.findOne({ email: email });
    if (!userFound) throw new BadRequestException('invalid information');

    const isPasswordMatch = await bcrypt.compare(password, userFound.password);
    if (!isPasswordMatch) throw new BadRequestException('invalid password');

    const accessToken = await this.generateToken({
      id: userFound.id,
      sub: userFound.name,
      role: userFound.role,
    });
    return {
      accessToken,
      user: userFound,
    };
  }

  async findAllUsers() {
    const users = await this.userRepo.find().select('-password');
    return {
      success: true,
      users: users,
    };
  }

  async findOneUser(id: string) {
    const user = await this.userRepo.findById(id).select('-password');
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    return {
      success: true,
      user: user,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findById(id).select('-password');
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    const updateUser = await this.userRepo.findByIdAndUpdate(
      id,
      {
        name: updateUserDto.name,
      },
      { new: true },
    );
    return {
      success: true,
      updateUser: updateUser,
    };
  }

  async removeUser(id: string) {
    const user = await this.userRepo.findById(id).select('-password');
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    await this.userRepo.findByIdAndDelete(id);
    return {
      success: true,
      message: 'User has been deleted',
    };
  }

  private generateToken(payload: JwtPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
