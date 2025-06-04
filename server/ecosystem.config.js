const dotenv = require('dotenv');

// 显式加载 .env.production 文件，并处理可能的错误
const loadEnv = (envPath) => {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`加载环境变量文件 ${envPath} 失败:`, result.error);
    return {};
  }
  return result.parsed;
};

module.exports = {
  apps: [
    {
      name: "ai-chat",
      script: "dist/main.js",
      cwd: "./", // 确保工作目录是项目根目录（与 npm run start:prod 一致）
      // 生产环境变量：显式加载 .env.production 并合并到进程环境
      env_production: {
        ...process.env, // 保留系统环境变量
        ...loadEnv('.env.production'), // 加载生产环境变量
        NODE_ENV: "production", // 显式设置 NODE_ENV（避免被覆盖）
        PORT: "80" // 从 .env.production 中读取，若未配置则默认 80
      },
      merge_env: true // 合并系统环境变量（已通过 ...process.env 处理）
    }
  ]
};
