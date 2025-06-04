import { Module } from "@nestjs/common";
import { TypeOrmModule, type TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { join } from "node:path";
console.log("🚀 ~ app.module.ts:11 ~ process.env.NODE_ENV:", process.env.NODE_ENV, process.env);
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [`.env.${process.env.NODE_ENV}`] }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as "mysql", // 显式指定数据库类型
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT), // 转换为数字类型
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      timezone: "Z", // 纠正时区偏差
      dateStrings: true, // 强制制日期类型作为字符串返回，而不是膨胀为JavaScript date对象
      // entities: [__dirname + "/**/*.entity{.ts,.js}"], // 实体类数组
      // retryDelay: 500, //重试连接数据库间隔
      // retryAttempts: 10, //重试连接数据库的次数
      synchronize: false, // 是否自动同步数据库架构 生产环境中最好关闭,以防数据丢失
      autoLoadEntities: true, //如果为true,将自动加载实体 forFeature() 方法注册的每个实体都将自动添加到 entities 中
    }),
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
