import { Controller, Post, Body, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "src/auth/auth.decorator";

@Controller("user")
@ApiTags("用户相关")
export class UserController {
  constructor(private readonly userService: UserService) {}
  // * 登录
  @Post("/login")
  @Public(true)
  @ApiOperation({ summary: "登录", description: "登录" }) // * 接口描述
  @ApiResponse({ status: 200, description: "用户信息" }) // * 返回信息
  @ApiBody({ type: CreateUserDto }) // * @ApiProperty() 不生效的情况下,可使用 @ApiBody() 显式设置请求体的定义
  login(@Body() createUserDto: CreateUserDto) {
    return this.userService.login(createUserDto);
  }
  // * 注册
  @Post("/register")
  @Public(true)
  @ApiOperation({ summary: "注册", description: "注册" })
  @ApiResponse({ status: 200, description: "success" })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }
  // * 更新
  @Patch("/updata")
  @ApiOperation({ summary: "更新用户信息", description: "更新用户信息" })
  @ApiResponse({ status: 200, description: "success" })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  updata(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updata(updateUserDto);
  }
  // * 验证 reCAPTCHA
  @Post("/recaptcha")
  @Public(true)
  @ApiOperation({ summary: "验证 reCAPTCHA", description: "验证客户端提交的 reCAPTCHA token" })
  @ApiResponse({ status: 200, description: "验证成功" })
  @ApiBody({
    description: "reCAPTCHA 验证请求体",
    schema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "从客户端获取的 reCAPTCHA token",
          example: "your_recaptcha_token_here",
        },
        action: {
          type: "string",
          description: "reCAPTCHA 动作名称(可选)",
          example: "login",
        },
      },
      required: ["token"],
    },
  })
  recaptcha(@Body() body: { token: string; action?: string }) {
    return this.userService.verifyRecaptcha(body.token, body.action);
  }
}
