import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '@prisma/client';
import { createWriteStream } from 'fs';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatroomService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {}

    async getChatroom(id: number) {
        return this.prismaService.chatroom.findUnique({
            where: {id: id}
        })
    }

    async createChatroom(name: string,sub:number) {
       const existingChatroom = await this.prismaService.chatroom.findFirst({
        where: {name: name}
       })
       if(existingChatroom) {
        throw new BadRequestException("chatroom with that name already exist")
       }
       await this.prismaService.chatroom.create({
        data: {
            name: name,
            users: {connect: {id: sub}}
        }
       })
    }

    async addUsersToChatroom(chatrooomId: number,userId: number[]) {
        const existingChatroom = await this.prismaService.chatroom.findUnique({
            where: {id: chatrooomId}
           })
           if(!existingChatroom) {
            throw new BadRequestException("chatroom with that name already exist")
           }
           const updatedChatroom = await this.prismaService.chatroom.update({
            where: {id: chatrooomId},
            data: {
                users: {connect: userId.map((id) => ({id: id}))}
            },
            include: {users: true}
           })
    }

    async getChatroomForUser(userId: number) {
        return this.prismaService.chatroom.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                users:  {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },//Eager loading for user
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        })
    }

  async sendMessage(
    chatrooomId: number,
    userId: number,
    content: string,
    imagePath: string
  ) {
  await this.prismaService.message.create({
    data: {
        content: content,
        imageUrl: imagePath,
        chatroomId: chatrooomId,
        userId: userId
    },
    include: {
        chatroom: {
            include: {users: true}
        },
        user: true
    }
  })
  }

  async saveImage(
    image: {
        createReadStream: () => any;
       filename: string;
       mimetype: string;
    }
  ) {
    const validImageType = ["image/jpeg","image/png","image/gif"];
    if(!validImageType.includes(image.mimetype)) {
        throw new BadRequestException({image: "invalid image type"})
    }

    const imageName = `${Date.now()}-${image.filename}`;
    const imagePath = `${this.configService.get("IMAGE_PATH")}/${imageName}`;
    const outputPath = `public${imagePath}`
    const stream = image.createReadStream();
    const writeStream = createWriteStream(outputPath);
    stream.pipe(writeStream);

    await new Promise((resolve,reject) => {
        stream.on("end",resolve);
        stream.on("error",reject);
    })
    return imagePath;
  }

}
 