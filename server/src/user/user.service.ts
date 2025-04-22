import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  // * 登录
  async login(createUserDto: CreateUserDto) {
    const user = await this.user.findOne({
      select: ["username", "id", "password", "avatar"], // 查询的字段 不然默认全部
      where: { username: createUserDto.username },
    });
    if (!user) return "账号不存在";
    const isMatch = await bcrypt.compare(createUserDto.password, user.password);
    if (!isMatch) throw new HttpException("密码不正确", HttpStatus.BAD_REQUEST);
    const token = await this.jwtService.signAsync(createUserDto);
    delete user.password;
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
}
