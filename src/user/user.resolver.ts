import { Resolver,Query,Context,Mutation,Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './types/user.types';
import { Response,Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/guard/graphql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path';
import {v4 as uuidv4} from "uuid"
import * as GraphqlUpload from "graphql-upload/GraphQLUpload.js"

@Resolver()
export class UserResolver {
    constructor(
    private readonly userService:UserService
    ) {}

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async updateUserProfile(
    @Args("fullname") fullname: string,
    @Args("file",{type: () => GraphqlUpload,nullable: true}) file: GraphqlUpload.FileUpload,
    @Context() ctx: {req:Request}
    ) {
        const imageUrl = file ? await this.storeImageAndGetUrl(file) : null
        const userId = ctx.req.user.sub;
        return this.userService.updateprofile(userId,fullname,imageUrl);
    }

    private async storeImageAndGetUrl(file:GraphqlUpload.FileUpload) {
        const {createReadStream,filename} = await file;
        const uniqueFileName = `${uuidv4()}_${filename}`;
        const imagePath = join(process.cwd(),"public","images",uniqueFileName);
        const imageUrl = `${process.env.APP_URL}/images${uniqueFileName}`;
        const readStream = createReadStream();
        readStream.pipe(createReadStream(imagePath))
        return imageUrl
    }

    @UseGuards(GraphqlAuthGuard)
    @Query(() => [User])
    async searchUsers(
        @Args("fullname") fullname: string,
        @Context() context: {req: Request}
    ) {
        return this.userService.searchUsers(fullname,context.req.user?.sub);
    }
}
