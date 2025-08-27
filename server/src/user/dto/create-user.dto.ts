import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class ValidateCommonDto {
  @ApiProperty({ title: "用户昵称", required: true }) // 定义 post
  @IsNotEmpty({ message: "用户名不能为空" })
  @IsString()
  @Length(3, 16, { message: "用户名的长度最小为3,最大为16" })
  username: string;
}

// 自定义校验密码装饰器
export const IsPassword = (params: { text: string; min?: number; max?: number }) => {
  const { text, min = 6, max = 16 } = params;
  return function (classObj: any, propertyName: string) {
    IsNotEmpty({ message: `${text}不能为空` })(classObj, propertyName);
    IsString()(classObj, propertyName);
    Length(min, max, { message: `${text}的长度最小为${min},最大为${max}` })(classObj, propertyName);
  };
};

export class CreateUserDto extends ValidateCommonDto {
  // @ApiProperty({ title: "用户密码", example: "123456" })
  @ApiProperty({ title: "用户密码", required: true })
  // @IsNotEmpty({ message: "密码不能为空" })
  // @IsString()
  // @Length(6, 16, {
  //   message: "密码的长度最小为6,最大为16",
  // })
  @IsPassword({ text: "密码" })
  password: string;
}
