import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
/**
 * 公共路由
 * @description 公共路由
 */
export const Public = (isPublic = false) => SetMetadata(IS_PUBLIC_KEY, isPublic);
