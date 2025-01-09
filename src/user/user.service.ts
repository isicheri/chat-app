import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import* as fs from "fs";
import {join} from "path";

@Injectable()
export class UserService {
    constructor(
     private readonly prismaService: PrismaService
    ) {}

   async updateprofile(userId: number,fullname: string,avatarUrl:string) {
    if(avatarUrl) {
        const oldeUser = await this.prismaService.user.findUnique({
            where: {id:userId}
        })
        
     const updatedUser = await this.prismaService.user.update({
            where: {id: userId},
            data: {
                fullname,
                avatarUrl
            }
        })

        if(oldeUser.avatarUrl) {
            const imageName = oldeUser.avatarUrl.split("/").pop();
            const imagePath = join(__dirname,"..","..","public","images",imageName);
            if(fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        }

        return updatedUser
    }
     return await this.prismaService.user.update({
            where: {id: userId},
            data: {
                fullname,
            }
        })
   }

}
