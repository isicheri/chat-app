import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { GraphqlAuthGuard } from 'src/auth/guard/graphql-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [UserResolver, UserService,PrismaService,JwtService],
})
export class UserModule {}
