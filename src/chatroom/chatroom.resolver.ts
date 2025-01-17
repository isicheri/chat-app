import { Args, Context, Mutation, Resolver,Query } from '@nestjs/graphql';
import { ChatroomService } from './chatroom.service';
import { UserService } from 'src/user/user.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GraphqlErrorFilter } from 'src/filters/custom-exception.filters';
import { GraphqlAuthGuard } from 'src/auth/guard/graphql-auth.guard';
import { Chatroom, Message } from './types/chatroom.types';
import { Request } from 'express';

@Resolver()
export class ChatroomResolver {
    constructor(
        private readonly chatroomService: ChatroomService,
        private readonly userServide: UserService
    ) {}

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

}
