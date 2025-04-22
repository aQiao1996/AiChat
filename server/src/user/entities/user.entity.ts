import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
// https://typeorm.bootcss.com/entities#%60mysql%60/%60mariadb%60%E7%9A%84%E5%88%97%E7%B1%BB%E5%9E%8B
@Entity()
export class User {
  //自增列
  @PrimaryGeneratedColumn()
  id: number;

  //普通列
  @Column({ unique: true, comment: "用户昵称" })
  username: string;

  @Column({ select: false, comment: "用户密码" })
  password: string;

  @Column({ comment: "用户头像", default: "" })
  avatar?: string;

  @CreateDateColumn({ comment: "账号创建时间" })
  createDate: Date;
}
