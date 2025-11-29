import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRolesGuard } from './guard/auth-roles.guard';
import { AuthService } from './provider/auth.provider';
// import { PaymentModule } from 'src/payment/payment.module';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthRolesGuard, AuthService],
  exports: [JwtModule, UserService, AuthRolesGuard],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<number>('JWT_EXPIRED') },
        };
      },
    }),
  ],
})
export class UserModule {}
