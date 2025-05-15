import { Controller, Post, Body, Sse, Get, Request, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("chat")
@ApiTags("AI相关")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("/createChat")
  @ApiOperation({ summary: "创建对话", description: "创建对话" })
  @ApiBody({ type: CreateChatDto })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "消息id" })
  create(@Body() createChatDto: CreateChatDto, @Request() request) {
    return this.chatService.create(createChatDto, request);
  }

  @Sse("/chatStream")
  @ApiQuery({ name: "chatId", required: true, description: "消息id", type: Number })
  @ApiQuery({
    name: "model",
    required: true,
    description: "模型名称",
    type: "enum",
    enum: ["deepseek-v3", "deepseek-r1"],
  })
  @ApiOperation({ summary: "对话(流式)", description: "对话(流式响应)" })
  @ApiResponse({ status: 200, description: "流式响应" })
  @ApiBearerAuth()
  async stream(@Query("chatId") chatId, @Query("model") model) {
    return this.chatService.createChatStream(chatId, model);
  }

  @Get("/messagesHistory")
  @ApiQuery({ name: "chatId", required: false, description: "消息id", type: Number })
  @ApiOperation({ summary: "获取消息历史", description: "获取消息历史" })
  @ApiBearerAuth()
  async getMessagesHistory(@Request() request) {
    return this.chatService.getMessagesHistory(request);
  }
}
