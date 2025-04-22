import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql", // 数据库类型
      host: "localhost", // 数据库主机类型
      port: 3306, // 端口号
      username: "root", // 用户名
      password: "0jdt001ar", // 密码
      database: "deepseek", // 要连接的数据库名称
      // entities: [__dirname + "/**/*.entity{.ts,.js}"], // 实体类数组
      // retryDelay: 500, //重试连接数据库间隔
      // retryAttempts: 10, //重试连接数据库的次数
      synchronize: true, // 是否自动同步数据库架构 生产环境中最好关闭,以防数据丢失
      autoLoadEntities: true, //如果为true,将自动加载实体 forFeature() 方法注册的每个实体都将自动添加到 entities 中
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
