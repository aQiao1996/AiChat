import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "0JDT001AR@yyq",
  database: "ai_chat_prod",
  entities: ["entity/*.js"],
  migrations: ["/migrations/*{.ts,.js}"],
  migrationsTableName: "typeorm_migrations",
});

export default dataSource;
