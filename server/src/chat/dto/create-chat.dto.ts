import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ChatMessageDto {
  @ApiProperty({
    enum: ["user", "assistant"],
    description: "消息角色"
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
    type: [ChatMessageDto],
    description: "消息列表"
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
