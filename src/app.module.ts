import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject : [ConfigService],
      useFactory: (config: ConfigService)=>{
        return {
          type:'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          port: config.get<number>("DB_PORT"),
          host:config.get<string>("DB_HOST"),
          synchronize: process.env.NODE_ENV !== "production"  || true,
          entities:[User]
        }
      }
    }),
    ConfigModule.forRoot({
      isGlobal : true,
      envFilePath : `.env`
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
