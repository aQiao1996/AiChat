module.exports = {
  apps: [
    {
      name: "ai-chat", // 应用名称
      script: "dist/main.js", // 启动脚本路径（NestJS 构建后的入口文件）
      cwd: "./", // 当前工作目录
      // 生产环境变量
      env_production: {
        PORT: 80,
        NODE_ENV: "production",
      },
      // 开发环境变量
      env_development: {
        PORT: 3000,
        NODE_ENV: "development",
      },
    },
  ],
};
