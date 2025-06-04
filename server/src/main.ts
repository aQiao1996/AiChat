import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import * as express from "express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/http-exception.filter";
import { ResponseInterceptor } from "./common/response.interceptor";
// import { Logger } from "@nestjs/common";

async function bootstrap() {
  // * 环境日志
  // const logger = new Logger("main.ts");
  // logger.log(`🚀 ~ main.ts ~ 当前运行环境: ${process.env.NODE_ENV || "环境错误"}`, process.env.DATABASE_NAME);
  console.log(`🚀 ~ main.ts ~ 当前运行环境: ${process.env.NODE_ENV || "环境错误"}`, process.env.DATABASE_NAME);
  // * 使用 express 作为默认框架
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // cors 处理跨域 或者直接 app.enableCors();
    // logger: ["error", "warn"], // 启用日志 禁用为false 数组中的值可以是 'log'、'fatal'、'error'、'warn'、'debug' 和 'verbose' 的任意组合
  });
  // 可以直接访问文件 如：http://localhost:3000/public/uploads/36T4NJ0P3UQCIU3GFRMARZ.jpeg
  // * 配置 public 文件夹为静态目录，以达到可直接访问下面文件的目的
  const rootDir = join(__dirname, "..");
  app.use("/public", express.static(join(rootDir, "public")));
  // * 注册全局过滤器处理HTTP异常
  app.useGlobalFilters(new HttpExceptionFilter());
  // * 注册全局成功响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  // * ValidationPipe 使用 class-validator npm包及其声明式验证装饰器。
  // https://nest.nodejs.cn/techniques/validation
  app.useGlobalPipes(new ValidationPipe());
  // * 注册全局守卫 执行在 拦截器 之前 执行在 中间件 之后
  // app.useGlobalGuards(new AuthGuard());
  // * 配置 swagger
  const config = new DocumentBuilder()
    .addBearerAuth() // jsonwebtoken 配合 @ApiBearerAuth() 使用
    .setTitle("胖虎") // 设置文档名称
    .setDescription("胖虎nestjs接口描述文档") // 设置文档描述
    .setVersion("1.0") // 设置文档版本
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 启用持久化
    },
  });
  await app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 ~ main.ts ~ 启动成功,端口号: ${process.env.PORT}`);
    console.log(`🚀 ~ main.ts ~ 启动成功,环境变量:`, process.env);
  });
}
bootstrap();
