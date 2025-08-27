import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform, Type } from "class-transformer";

export class ChatMessageDto {
  @ApiProperty({
    enum: ["user", "assistant"],
    description: "消息角色",
  })
  @IsNotEmpty()
  @IsString()
  role: "user" | "assistant";

  @ApiProperty({ description: "消息内容" })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: "推理内容" })
  reasoningContent?: string;
}

export class CreateChatDto {
  @ApiProperty({
    type: () => ChatMessageDto,
    description: "消息",
  })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto;

  @ApiProperty({ description: "消息id", required: false })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined; // 忽略无效值
    }
    return Number(value);
  })
  chatId?: number;
}

export class UpdateChatTitleDto {
  @ApiProperty({ description: "聊天记录ID", type: Number })
  @ApiProperty({ description: "消息id", required: false })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined; // 忽略无效值
    }
    return Number(value);
  })
  chatId: number;

  @ApiProperty({ description: "新标题", type: String })
  @IsNotEmpty({ message: "title 不能为空" })
  @IsString({ message: "title 必须是字符串" })
  @MaxLength(30, { message: "标题长度不能超过 30 个字符" })
  title: string;
}
