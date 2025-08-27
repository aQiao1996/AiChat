// import * as jwt from "jsonwebtoken"; // 已弃用 改为 @nestjs/jwt
import { JwtService } from "@nestjs/jwt";
// 列表查询
type QueryType = Partial<{
  pageNum: number; // 页码
  pageSize: number; // 每页数量
  isAsc: "desc" | "asc"; // 排序方式 desc-降序 asc-升序
  [key: string]: any;
}>;
const jwtService = new JwtService();
// * jwt 相关
// export const jwtHelper = (KEY = "nest_panghu", expiresIn = 60 * 60 * 12) => {
//   // const KEY = "nest_panghu"; // 秘钥
//   // const expiresIn = 60 * 60 * 12; // 12个小时 或者直接 字符串 12h 这种
//   return {
//     getToken(data: object) {
//       return jwt.sign(data, KEY, { expiresIn });
//     },
//     verifyToken(token: string) {
//       if (!token || !token.startsWith("Bearer ")) {
//         throw new Error("Invalid token format or token is missing");
//       }
//       const Authorization = token?.replace("Bearer ", "");
//       try {
//         return jwt.verify(Authorization, KEY);
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//   };
// };

// * 返回文件字节大小
export const formatFileSize = size => {
  size = Number(size);
  if (isNaN(size) || size === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  const formattedSize = parseFloat((size / Math.pow(k, i)).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
};

// * 处理查询
export const handleFindOptions = (params: { order?: any } & QueryType) => {
  const { pageNum, pageSize, isAsc = "desc", order } = params;
  let options = {};
  if (pageNum > 0 && pageSize > 0) {
    options["skip"] = (pageNum - 1) * pageSize;
    options["take"] = +pageSize;
  }
  // 排序
  if (isAsc) {
    options["order"] = { createDate: isAsc };
  }
  // 如果传进来一个对象 直接覆盖上面 order
  if (order) {
    options["order"] = order;
  }
  return options;
};

// * 获取token中用户信息
export const getTokenUserInfo = (authorization: string) => {
  const [type, token] = authorization.split(" ") ?? [];
  const result = type === "Bearer" ? authorization : undefined;
  if (!result) return {};
  const data = jwtService.decode(token);
  return data;
};
