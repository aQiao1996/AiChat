const { DataSource } = require('typeorm');
const path = require('path');

// 自动加载所有 entity 文件
const loadEntities = () => {
  const entitiesDir = path.join(__dirname, '**', '*.entity{.ts,.js}');
  return [entitiesDir];
};

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '0JDT001AR@yyq',
  database: 'ai_chat_prod',
  synchronize: false,
  logging: false,
  entities: loadEntities(),
  migrations: ['src/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
   // 连接池配置
  poolSize: 10, // 连接池大小
  acquireTimeout: 30000 // 获取连接的超时时间（毫秒）
});

module.exports = { AppDataSource };
