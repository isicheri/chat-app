import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './types/auth.types';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { Request, Response } from 'express';
import { GraphqlErrorFilter } from 'src/filters/custom-exception.filters';


@UseFilters(GraphqlErrorFilter)
@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService:AuthService
    ) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args("registerInput") registerDto:RegisterDto,
    @Context() context: {res:Response}
  ) {
   if(registerDto.password !== registerDto.confirmPassword) {
   throw new BadRequestException("password and confirm password are not the same");
   }
   const {user} = await this.authService.register(
    registerDto,
    context.res
   )
   return {user};
  }

  @Query(() => LoginResponse)
  async login(
    @Args("loginInput") loginDto: LoginDto,
    @Context() ctx: {res:Response}
  ) {
    return this.authService.loginUser(loginDto,ctx.res);
  }

  @Mutation(() => String)
  async logout(@Context() context: {res:Response}) {
return this.authService.logout(context.res);
  }

  @Mutation(() => String)
  async refreshToken(
    @Context() ctx: {req:Request,res:Response}
  ) {
try {
   return this.authService.refreshToken(ctx.req,ctx.res) 
} catch (error) {
    throw new BadRequestException(error.message)
}
  }
}
