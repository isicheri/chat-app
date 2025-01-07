import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty } from "class-validator";


@InputType()
export class RegisterDto {

    @Field()
    @IsNotEmpty({ message: "Full name is required" }) 
    fullname: string

    @Field()
    @IsNotEmpty({ message: "password is required" }) 
    password: string

    @Field()
    @IsNotEmpty({ message: "confirm password is required" }) 
    confirmPassword: string

    @Field()
    @IsNotEmpty({ message: "email is required" }) 
    email: string
}

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({message: "email is required"})
    @IsEmail({},{message: "input a valid email"})
    email: string;

    @Field()
    @IsNotEmpty({message: "password is required"})
    password: string
}