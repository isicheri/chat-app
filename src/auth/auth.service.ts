import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt:JwtService,
        private readonly prisma:PrismaService,
        private readonly configService: ConfigService
    ) {}
     
    async refreshToken(req:Request,res:Response) {
        const refreshToken = req.cookies["refresh_token"];
        if(!refreshToken) {
          throw  new UnauthorizedException("refresh token not found")
        }
        let payload;
        try {
            payload = this.jwt.verify(refreshToken,{
                secret: this.configService.get<string>("REFRESH_TOKEN_SECRET")
            })
            
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired refresh token")
        }
        const userExists = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        if(!userExists) {
            throw new BadRequestException("User not authorised")
        }
        const XpiresIn = 15000;
        const expiration = Math.floor(Date.now() / 1000) + XpiresIn;
        const accessToken = this.jwt.sign(payload,{secret: this.configService.get<string>("ACCESS_TOKEN_SECRET")});
        res.cookie('access_token',accessToken,{httpOnly: true})

return accessToken;
    }

    private async issueToken(user:User,res:Response) {
        let payload = {username: user.fullname,sub:user.id}
      const accessToken = this.jwt.sign({...payload},{secret: this.configService.get<string>("REFRESH_TOKEN_SECRET")})
      const refreshToken = this.jwt.sign(payload,{secret: this.configService.get<string>("REFRESH_TOKEN_SECRET")})
      res.cookie('access_token',accessToken,{httpOnly: true})
      res.cookie('refresh_token',refreshToken,{httpOnly: true})
      return {user}
    }

    async validateUser(loginDto:LoginDto) {
    const user = await this.prisma.user.findUnique({
        where: {
            email: loginDto.email
        }
    })
   if(user && (await bcrypt.compare(loginDto.password,user.password))) {
    return user
   }
   return null;
    }

    async register(registerDto: RegisterDto,res: Response) {
    const existUser = await this.prisma.user.findUnique({
        where: {
            email: registerDto.email
        }
    })
    if(existUser) {
        throw new BadRequestException("user with this email already exist");
    }
    const hashedPassword = await bcrypt.hash(registerDto.password,10)
    const user = await this.prisma.user.create({
        data: {
            ...registerDto,
            password: hashedPassword
        }
    })
    return this.issueToken(user,res)
    }

    async loginUser (loginDto:LoginDto,res:Response) {
     const user = await this.validateUser(loginDto);
     if(!user) {
        throw new BadRequestException({
            invalidCredentials: "Invalid credentials"
        })
     }
     return this.issueToken(user,res)
    }

    async logout(res:Response) {
        res.clearCookie("access_token");
        return "successfully logged out"
    }
}
