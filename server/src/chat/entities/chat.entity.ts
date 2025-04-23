import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { CreateChatDto } from "../dto/create-chat.dto";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: "用户id" })
  userId: number;

  @Column({ type: "json", comment: "聊天消息内容" })
  messages: CreateChatDto;

  @CreateDateColumn({ comment: "聊天创建时间" })
  createDate: Date;
}
