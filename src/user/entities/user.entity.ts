import { Exclude } from "class-transformer";
import { CURRENT_TIMESTAMP } from "src/utils/constants";
import { UserType } from "src/utils/enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string
    @Column()
    firstName : string 
    @Column()
    lastName : string 
    @Column({unique:true})
    email : string 
    @Column()
    @Exclude()
    password: string 
    @Column({ type:'enum',enum:UserType, default : UserType.CLIENT})
    role: UserType 
    @CreateDateColumn({type:'timestamp' , default:() => CURRENT_TIMESTAMP})
    createdAt:Date 
    @UpdateDateColumn({type : 'timestamp' , default:() => CURRENT_TIMESTAMP , onUpdate: CURRENT_TIMESTAMP})
    updateAt:Date  
}
