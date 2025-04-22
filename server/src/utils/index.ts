// import * as jwt from "jsonwebtoken"; // 已弃用 改为 @nestjs/jwt

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

// * 处理分页
export const handlePageing = ({ pageNum, pageSize }) => {
  let options = {};
  if (pageNum && pageNum > 0 && pageSize && pageSize > 0) {
    options["skip"] = (pageNum - 1) * pageSize;
    options["take"] = +pageSize;
  }
  return options;
};
