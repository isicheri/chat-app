import { Args, Context, Mutation, Resolver,Query, Subscription } from '@nestjs/graphql';
import { ChatroomService } from './chatroom.service';
import { UserService } from 'src/user/user.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GraphqlErrorFilter } from 'src/filters/custom-exception.filters';
import { GraphqlAuthGuard } from 'src/auth/guard/graphql-auth.guard';
import { Chatroom, Message } from './types/chatroom.types';
import { Request } from 'express';
import { PubSub} from "graphql-subscriptions";
import { User } from 'src/user/types/user.types';
import { PrismaService } from 'src/prisma.service';
import * as GraphQlUpload from "graphql-upload/GraphQLUpload.js"

@Resolver()
export class ChatroomResolver {
    pubsub: PubSub<Record<string, never>>;
    constructor(
        private readonly chatroomService: ChatroomService,
        private readonly userService: UserService,
        private readonly prismaService: PrismaService
    ) {
        this.pubsub = new PubSub();
    }

    @Subscription((returns) => Message,{
        nullable: true,
        resolve: (value) => value.newMessage
    })
    newMessage(@Args("chatroomId") chatroomId:number) {
        return this.pubsub.asyncIterableIterator(`newMessage,${chatroomId}`)
    }


    @Subscription((returns) => User,{
        nullable: true,
        resolve: (value) => value.user,
        filter:(payload,variable) => {
            console.log("payload1:",variable,)
            return variable.userId !== payload.typingUser
        } 
    })
    userStartedTyping(
        @Args("chatroomId") chatroomId: number
    ) {
        return this.pubsub.asyncIterableIterator(`userStartedTyping${chatroomId}`)
    }


    @UseFilters(GraphqlErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async userStartedTypingMutation(
        @Args("chatroomId") chatroomId: number,
        @Context() context: {req: Request}
    ) {
     const user = await this.prismaService.user.findUnique({
        where: {
            id: context.req.user?.sub
        }
     })
     await this.pubsub.publish(`userStartedTyping.${chatroomId}`,{
        user,
        typingUserId: user.id
     })
     return user;
    }


    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async userStoppedTypingMutation(
        @Args("chatroomId") chatroomId: number,
        @Context() context: {req: Request}
    ) {
     const user = await this.prismaService.user.findUnique({
        where: {
            id: context.req.user?.sub
        }
     })
     await this.pubsub.publish(`userStoppedTyping.${chatroomId}`,{
        user,
        typingUserId: user.id
     })
     return user;
    }



    @UseFilters(GraphqlErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Message)
    async sendMessage(
        @Args("chatroomId") chatroomId: number,
        @Context("context") context: {req: Request},
        @Args("content") content: string,
        @Args("image",{type: () => GraphQlUpload,nullable: true}) image?: GraphQlUpload

    ) {
     let imagePath = null;
     if(image) imagePath = await this.chatroomService.saveImage(image);
     const newMessage = await this.chatroomService.sendMessage(
        chatroomId,
        context.req.user?.sub,
        content,
        image
     )

     await this.pubsub.publish(`newMessge.${chatroomId}`,{newMessage}).then((res) => {
        console.log("published",res);
     })
     .catch((error) => {
        console.log(error)
     })

     }
    


    @UseFilters(GraphqlErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Chatroom)
    async createChatroom(
        @Args("name") name: string,
        @Context() context: {req: Request}
    ) {
        return this.chatroomService.createChatroom(name,context.req.user?.sub);
    }


    @Mutation(() => Chatroom)
    async addUsersToChatroom(
        @Args("chatroomId") chatroomId: number,
        @Args("userIds",{type: () => [Number]}) userIds: number[]
    ) {
        return await this.addUsersToChatroom(chatroomId,userIds);
    }

  
    @Query(() => [Chatroom])
    async getChatroomsForUser(
        @Args("userId") userId: number,
    ) {
        return await  this.getChatroomsForUser(userId);
    }


    @Query(() => [Message])
    async getMessagesForChatroom(
        @Args("chatroomId") chatroomId: number
    ) {
        return this.chatroomService.getMessagesForChatroom(chatroomId)
    }

    @Mutation(() => String)
    async deleteChatroom(
        @Args("chatroomId") chatroomId: number
    ) {
        await this.chatroomService.deleteChatroom(chatroomId);
        return "Chatroom successfully deleted";
    }
}
