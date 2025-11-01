import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Login, Register } from "../dto/create-user.dto";
import * as bcrypt from 'bcryptjs'
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadType } from "src/utils/types";


@Injectable()
export class AuthService {
    constructor(@InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService : JwtService ,
    ){}

    
        /**
         * Register 
         * @param registerDto 
         * @returns token
         */
    
        public async register(registerDto : Register){
            const {email , firstName , lastName ,  password , role} = registerDto
    
            const userFromDB = await this.userRepo.findOne({where : {email}})
            if (userFromDB) throw new BadRequestException("user is already exist !!")
            
            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(password,salt)
    
            let newUser = this.userRepo.create({
                email,
                password: passwordHash,
                firstName,
                lastName,
                role
            })
            newUser = await this.userRepo.save(newUser)
            delete newUser.password
            const accessToken = await this.generateToken({id : newUser.id ,sub : newUser.firstName, userType : newUser.role})
            return {
                accessToken,
                newUser
            };
        }
    
    
        /**
         * Log in 
         * @param loginDto 
         * @returns token 
         */
    
    
        public async login (loginDto : Login){
            const {password , email} = loginDto
            
            const userFound = await this.userRepo.findOne({where : [{email}]})
            if (!userFound) throw new BadRequestException("invalid information")
    
            const isPasswordMatch = await bcrypt.compare(password,userFound.password)
            if(!isPasswordMatch) throw new BadRequestException("invalid password")
    
            const accessToken = await this.generateToken({id : userFound.id , sub : userFound.firstName, userType : userFound.role})
            return {
                accessToken,
                user:userFound
            } ;
        }

        /**
         * Generate Jwt Token
         * @param payload  
         * @returns token
         */
        
        private generateToken (payload : JwtPayloadType) : Promise<string> {
                return this.jwtService.signAsync(payload)
        }
}