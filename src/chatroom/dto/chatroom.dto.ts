import { Field, ObjectType } from "@nestjs/graphql";
import {
    IsNotEmpty,
    IsString,
    IsArray
} from "class-validator"


@ObjectType()
export class CreateChatroomDto {

    @Field()
    @IsNotEmpty({message: "Name is required"})
    @IsString()
    name: string;
    
    @IsArray()
    @Field(() => [Number])
    userIds: number[]

}