import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = (isPublic = false) => SetMetadata(IS_PUBLIC_KEY, isPublic); // 公共路由
