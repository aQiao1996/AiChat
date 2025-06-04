const dotenv = require('dotenv');
const path = require('path'); // 新增：用于处理绝对路径

// 显式加载环境文件（使用绝对路径）
const loadEnv = (envFileName) => {
  // 构造绝对路径（当前文件所在目录 + 环境文件名）
  const envPath = path.join(__dirname, envFileName); 
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`加载环境变量文件 ${envPath} 失败:`, result.error);
    return {};
  }
  console.log(`成功加载环境变量文件 ${envPath}`); // 新增：验证加载成功
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
        ...loadEnv('.env.production'), // 加载生产环境变量（绝对路径）
        NODE_ENV: "production" // 显式设置 NODE_ENV（避免被覆盖）
      },
      merge_env: true
    }
  ]
};
