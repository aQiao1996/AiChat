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
}
