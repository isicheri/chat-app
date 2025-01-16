import { ObjectType,Field,ID } from "@nestjs/graphql";
import { User } from "src/user/types/user.types";



@ObjectType()
export class Chatroom {
    @Field(() => ID, {nullable: true})
    id?:number

    @Field(() => String,{nullable: true})
    name?: string;

    @Field({nullable: true})
    createdAt?: Date

    @Field({nullable: true})
    updatedAt?: Date

    @Field(() => [User],{nullable: true})
    users?: User[];

    @Field(() => [ID],{nullable: true})
    messages?: Message[]

}


@ObjectType()
export class Message {
    
    @Field(() => ID,{nullable: true})
    id?: number

    @Field({nullable: true})
    createdAt?: Date

    @Field({nullable: true})
    updatedAt?: Date

    @Field(() => String,{nullable: true})
    content?: string

    @Field(() => String,{nullable: true})
    imageUrl: string

    @Field(() => User,{nullable: true})
    user?: User

    @Field(() => Chatroom,{nullable: true})
    chatroom: Chatroom

}


ObjectType()
export class UserTyping {

@Field(() => User,{nullable: true})
user?: User

@Field({nullable: true})
chatroomId?: number

}

@ObjectType()
export class UserStoppedTyping extends UserTyping {}