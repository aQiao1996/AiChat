import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Message } from "./message.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Message, message => message.chat, {
    eager: false, // 避免 N+1 查询问题（默认 lazy 加载）
    cascade: ["insert", "update"], // 级联保存/更新消息
  })
  messages: Message[];

  @ManyToOne(() => User, user => user.chats, {
    onDelete: "CASCADE", // 如果 Chat 被删除，关联的 Message 也删除
  })
  user: User;

  @Column({ comment: "聊天标题" })
  title?: string;

  @CreateDateColumn({ comment: "聊天创建时间" })
  createDate: Date;
}
