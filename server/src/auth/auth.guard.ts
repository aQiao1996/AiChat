import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { jwtConstants } from "./constants";
import { IS_PUBLIC_KEY } from "./auth.decorator";
import type { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 验证token
   * @description 验证token
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 是否公共路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException("暂无权限");
    try {
      await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
    } catch {
      throw new UnauthorizedException("暂无权限");
    }
    return true;
  }
  
  /**
   * 从标头提取令牌
   * @description 从标头提取令牌
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
