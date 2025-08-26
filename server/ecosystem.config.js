const dotenv = require("dotenv");
const path = require("node:path"); 

// 显式加载环境文件（使用绝对路径）
const loadEnv = envFileName => {
  // 构造绝对路径（当前文件所在目录 + 环境文件名）
  const envPath = path.join(__dirname, envFileName);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`🚀 ~ ecosystem.config.js ~ 加载环境变量文件 ${envPath} 失败:`, result.error);
    return {};
  }
  console.log(`🚀 ~ ecosystem.config.js ~ 成功加载环境变量文件 ${envPath}`);
  return result.parsed;
};

module.exports = {
  apps: [
    {
      name: "ai-chat",
      script: "dist/main.js",
      cwd: path.join(__dirname), // 明确设置工作目录为项目根目录（与当前文件同目录）
      env_production: {
        ...process.env, // 保留系统环境变量
        ...loadEnv(".env.production"), // 加载生产环境变量（绝对路径）
        NODE_ENV: "production", // 显式设置 NODE_ENV（避免被覆盖）
      },
      merge_env: true,
    },
  ],
};
