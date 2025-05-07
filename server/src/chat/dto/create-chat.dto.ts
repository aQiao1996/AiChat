import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
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
