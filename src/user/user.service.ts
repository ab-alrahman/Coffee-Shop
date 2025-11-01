import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Login, Register } from './dto/create-user.dto';
import { JwtPayloadType} from '../utils/types'
import { UpdateInfoUser } from './dto/update-user.dto';
import { UserType } from '../utils/enum';
import { AuthService } from './provider/auth.provider';

@Injectable()
export class UserService {
    constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly authService : AuthService
){}

    /**
     * Register 
     * @param registerDto 
     * @returns token
     */

    public async register(registerDto : Register){
        return await this.authService.register(registerDto)
    }


    /**
     * Log in 
     * @param loginDto 
     * @returns token 
     */


    public async login (loginDto : Login){
        return await this.authService.login(loginDto)
    }

    /**
     * Get All Users 
     * @returns User's Count And Users
     */

    public async getUsers (){
        const users = await this.userRepo.find();
        const userCount = await this.userRepo.count()
        return {
            users,
            userCount
        }
    }

    /**
     * Get User By Id 
     * @param id 
     * @returns User 
     */

     public async getUserById(id: string) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new ForbiddenException("User does not exist");
        return user;
    }

    /**
     * Update User from db
     * @param id 
     * @param updateUserDto 
     * @returns user
     */

    public async updateUserById (id : string , updateUserDto : UpdateInfoUser){
        const {firstName,lastName} = updateUserDto 

        const upUser = await this.userRepo.findOne({where : {id}})
         upUser.firstName = firstName ?? upUser.firstName
         upUser.lastName = lastName ?? upUser.lastName
         return upUser;
    }


    /**
     * Delete User from db 
     * @param id 
     * @param paylaod 
     * @returns deleted user 
     */

    public async deleteUser(id : string , paylaod : JwtPayloadType){
        const user = await this.userRepo.findOne({where : {id}});
        if (user.id === paylaod?.id || paylaod.userType === UserType.ADMIN){
            await this.userRepo.remove(user);
            return {message : 'User has been deleted '}
        }
    }
}
