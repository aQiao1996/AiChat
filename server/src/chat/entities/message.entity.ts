import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Chat } from "./chat.entity";
import type { CreateChatDto } from "../dto/create-chat.dto";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, chat => chat.messages, {
    onDelete: "CASCADE", // 如果 Chat 被删除，关联的 Message 也删除
  })
  chat: Chat; // 外键关联到 Chat

  @Column({ type: "json", nullable: false, comment: "消息内容（JSON 格式）" })
  content: CreateChatDto[];

  @Column({ comment: "消息类型（user/assistant" })
  role: "user" | "assistant";

  @Column({ comment: "消息时间戳" })
  timestamp: Date;
}
