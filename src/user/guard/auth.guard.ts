import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtPayloadType } from "../../utils/types";


@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private readonly jwtService : JwtService,
        private readonly config : ConfigService
    ){}

    async canActivate(context: ExecutionContext){
        const request : Request = context.switchToHttp().getRequest();
        const [type,token] = request.headers.authorization?.split(" ") ?? []
        if (token && type === "Bearer"){
            try {
            const payload : JwtPayloadType = await this.jwtService.verifyAsync(
                token,
                {
                    secret : this.config.get<string>("JWT_SECRET")
                }
            )
            request["user"] = payload
            } catch (error) {
                throw new UnauthorizedException("access denied , invalid token")    
            }
        }   else {
            return false
        }
        return true;
    }

}