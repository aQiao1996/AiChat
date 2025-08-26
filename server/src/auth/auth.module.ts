import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "12h" },
      global: true, // 如果只想在 AuthModule 中使用 JWT，则不要设置此选项
    }),
  ],
  providers: [
    {
      provide: APP_GUARD, // 全局守卫
      useClass: AuthGuard, 
    },
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
