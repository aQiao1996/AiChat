import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: "用户ID" })
  userId: number;

  @OneToMany(() => Message, message => message.chat, {
    eager: false, // 避免 N+1 查询问题（默认 lazy 加载）
    cascade: ["insert", "update"], // 级联保存/更新消息
  })
  messages: Message[];

  @CreateDateColumn({ comment: "聊天创建时间" })
  createDate: Date;
}
