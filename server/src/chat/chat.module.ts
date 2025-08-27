import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { User } from "src/user/entities/user.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, User])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
