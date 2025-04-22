import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ChatMessageDto {
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
    enum: ["deepseek-v3", "deepseek-r1"],
    description: "模型名称"
  })
  @IsNotEmpty({ message: "模型不能为空" })
  @IsString()
  model: "deepseek-v3" | "deepseek-r1";

  @ApiProperty({ 
    type: [ChatMessageDto],
    description: "消息列表"
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
