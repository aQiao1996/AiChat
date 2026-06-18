import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1718600000000 implements MigrationInterface {
  name = "InitSchema1718600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`user\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(255) NOT NULL COMMENT '用户昵称',
        \`password\` varchar(255) NOT NULL COMMENT '用户密码',
        \`avatar\` varchar(255) NOT NULL DEFAULT '' COMMENT '用户头像',
        \`createDate\` datetime(6) NOT NULL COMMENT '账号创建时间' DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_user_username\` (\`username\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`chat\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL COMMENT '聊天标题',
        \`createDate\` datetime(6) NOT NULL COMMENT '聊天创建时间' DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\` int NULL,
        INDEX \`IDX_chat_userId\` (\`userId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`message\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`content\` json NOT NULL COMMENT '消息内容（JSON 格式）',
        \`role\` varchar(255) NOT NULL COMMENT '消息类型（user/assistant',
        \`timestamp\` datetime NOT NULL COMMENT '消息时间戳',
        \`chatId\` int NULL,
        INDEX \`IDX_message_chatId\` (\`chatId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`chat\`
      ADD CONSTRAINT \`FK_chat_user\`
      FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`message\`
      ADD CONSTRAINT \`FK_message_chat\`
      FOREIGN KEY (\`chatId\`) REFERENCES \`chat\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `message` DROP FOREIGN KEY `FK_message_chat`");
    await queryRunner.query("ALTER TABLE `chat` DROP FOREIGN KEY `FK_chat_user`");
    await queryRunner.query("DROP TABLE `message`");
    await queryRunner.query("DROP TABLE `chat`");
    await queryRunner.query("DROP TABLE `user`");
  }
}
