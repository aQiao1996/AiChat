const dotenv = require('dotenv');

module.exports = {
  apps: [
    {
      name: "ai-chat",
      script: "dist/main.js",
      cwd: "./",
      // 生产环境变量
      env_production: {
        PORT: 80,
        NODE_ENV: "production",
        ...dotenv.config({ path: '.env.production' }).parsed
      },
      // 开发环境变量
      env_development: {
        PORT: 3000,
        NODE_ENV: "development",
        ...dotenv.config({ path: '.env.development' }).parsed
      },
      merge_env: true // 合并环境变量
    },
  ],
};
