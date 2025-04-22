import { Controller, Post, Body } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Public } from "src/auth/auth.decorator";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("chat")
@ApiTags("AI相关")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("/createChat")
  @Public(true)
  @ApiOperation({ summary: "创建对话(流式)", description: "创建对话(流式响应)" })
  @ApiBody({ type: CreateChatDto })
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }
}
