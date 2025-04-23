import { Controller, Post, Body, Sse, Get, Request } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Public } from "src/auth/auth.decorator";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("chat")
@ApiTags("AI相关")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("/createChat")
  @ApiOperation({ summary: "创建对话", description: "创建对话" })
  @ApiBody({ type: CreateChatDto })
  @ApiBearerAuth()
  create(@Body() createChatDto: CreateChatDto, @Request() request) {
    return this.chatService.create(createChatDto, request);
  }

  @Sse("/chatStream")
  @ApiOperation({ summary: "对话(流式)", description: "对话(流式响应)" })
  @ApiBearerAuth()
  async stream(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChatStream(createChatDto);
  }

  @Get("/messagesHistory")
  @ApiOperation({ summary: "获取消息历史", description: "获取消息历史" })
  @ApiBearerAuth()
  async getMessagesHistory() {
    return;
  }
}
