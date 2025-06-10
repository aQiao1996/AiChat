import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
  // * 登录
  async login(createUserDto: CreateUserDto) {
    const user = await this.user.findOne({
      select: ["username", "id", "password"], // 查询的字段 不然默认全部
      where: { username: createUserDto.username },
    });
    if (!user) return "账号不存在";
    const isMatch = await bcrypt.compare(createUserDto.password, user.password);
    if (!isMatch) throw new HttpException("密码不正确", HttpStatus.BAD_REQUEST);
    delete user.password;
    const token = await this.jwtService.signAsync({ ...user });
    return { ...user, token };
  }
  // * 注册
  async register(createUserDto: CreateUserDto) {
    const user = await this.user.findOne({ where: { username: createUserDto.username } });
    if (user) throw new HttpException("用户名重复", HttpStatus.BAD_REQUEST);
    const newPwd = await bcrypt.hash(createUserDto.password, await bcrypt.genSalt());
    await this.user.save({ username: createUserDto.username, password: newPwd });
    return null;
  }
  // * 更新用户信息
  async updata(updateUserDto: UpdateUserDto) {
    const { id, newPassword, oldPassword } = updateUserDto;
    const user = await this.user.findOne({
      select: ["username", "id", "password"], // 查询的字段 不然默认全部
      where: { id },
    });
    if (!user) return "账号不存在";
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new HttpException("密码不正确", HttpStatus.BAD_REQUEST);
    if (newPassword === oldPassword) throw new HttpException("新旧密码不能一致", HttpStatus.BAD_REQUEST);
    const newPwd = await bcrypt.hash(newPassword, await bcrypt.genSalt());
    // await this.user.update(id, { password: newPwd });
    return null;
  }
  // * 验证 reCAPTCHA
 async verifyRecaptcha(token: string, action?: string) {
  if (!token) {
    throw new HttpException("reCAPTCHA token is required", HttpStatus.FORBIDDEN);
  }

  const secretKey = this.configService.get<string>("RECAPTCHA_SITE_KEY");
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  
  try {
    const response = await axios.post(url);
    const googleResponse = response.data;
    
    if (!googleResponse.success) {
      throw new HttpException(
        `reCAPTCHA verification failed: ${googleResponse["error-codes"]}`,
        HttpStatus.FORBIDDEN
      );
    }

    // 检查分数阈值（通常0.5以上认为是人类）
    if (googleResponse.score < 0.5) {
      throw new HttpException("reCAPTCHA score too low", HttpStatus.FORBIDDEN);
    }

    // 检查action是否匹配（如果有提供action参数）
    if (action && googleResponse.action !== action) {
      throw new HttpException("reCAPTCHA action mismatch", HttpStatus.FORBIDDEN);
    }

    return true;
  } catch (error) {
    console.log("🚀 ~ user.service.ts:87 ~ verifyRecaptcha ~ error:", error);
    throw new HttpException(
      error.message || "reCAPTCHA verification error",
      error.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
}
