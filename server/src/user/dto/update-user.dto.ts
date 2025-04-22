import { ApiProperty } from "@nestjs/swagger";
import { IsPassword } from "./create-user.dto";
import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ title: "用户id", required: true }) // 定义 post
  @IsNotEmpty({ message: "缺少用户id" })
  id: number;
  @ApiProperty({ title: "旧密码", required: true })
  @IsPassword({ text: "旧密码" })
  oldPassword: string;
  @ApiProperty({ title: "新密码", required: true })
  @IsPassword({ text: "新密码" })
  newPassword: string;
}
