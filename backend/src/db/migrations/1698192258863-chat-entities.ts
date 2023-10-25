import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatEntities1698192258863 implements MigrationInterface {
  name = 'ChatEntities1698192258863';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "private_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "receiverId" integer, CONSTRAINT "PK_1bf7cc91ba0b17389d76f7ad2a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "groupChatId" integer, "senderId" integer, CONSTRAINT "PK_f4b396868f303fa38023b61d742" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_chats" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "password" character varying, "visibility" character varying NOT NULL DEFAULT 'public', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" integer, CONSTRAINT "UQ_d84e7bc436eeeccee3b99823293" UNIQUE ("name"), CONSTRAINT "UQ_c1f0801674010ad8908a5405e7a" UNIQUE ("password"), CONSTRAINT "PK_2850524c61524bab74e754a2335" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members" ("id" SERIAL NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "isMuted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "profileId" integer, CONSTRAINT "PK_86446139b2c96bfd0f3b8638852" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_chat_members" ("groupChatsId" integer NOT NULL, "groupMembersId" integer NOT NULL, CONSTRAINT "PK_cb80a9ee09ce98b0f13ffe4f77f" PRIMARY KEY ("groupChatsId", "groupMembersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b74616bc58646fbb19767e8771" ON "group_chat_members" ("groupChatsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3960db0a5030e4f2981fc41021" ON "group_chat_members" ("groupMembersId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "group_chat_banned_members" ("groupChatsId" integer NOT NULL, "groupMembersId" integer NOT NULL, CONSTRAINT "PK_66d08f407bf99b0cffb750ac0ea" PRIMARY KEY ("groupChatsId", "groupMembersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0b21d45e8922181fb4d2ab3ed" ON "group_chat_banned_members" ("groupChatsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5265240d723f5f62f5d65363e" ON "group_chat_banned_members" ("groupMembersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_5938be33949ac6364947acbc832" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" ADD CONSTRAINT "FK_49f4d6046e24075f841f92b045b" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" ADD CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chats" ADD CONSTRAINT "FK_04d6ca7794c8f06f614767c4117" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_members" ADD CONSTRAINT "FK_b74616bc58646fbb19767e87710" FOREIGN KEY ("groupChatsId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_members" ADD CONSTRAINT "FK_3960db0a5030e4f2981fc41021b" FOREIGN KEY ("groupMembersId") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_banned_members" ADD CONSTRAINT "FK_b0b21d45e8922181fb4d2ab3ed6" FOREIGN KEY ("groupChatsId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_banned_members" ADD CONSTRAINT "FK_d5265240d723f5f62f5d65363ed" FOREIGN KEY ("groupMembersId") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_chat_banned_members" DROP CONSTRAINT "FK_d5265240d723f5f62f5d65363ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_banned_members" DROP CONSTRAINT "FK_b0b21d45e8922181fb4d2ab3ed6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_members" DROP CONSTRAINT "FK_3960db0a5030e4f2981fc41021b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chat_members" DROP CONSTRAINT "FK_b74616bc58646fbb19767e87710"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chats" DROP CONSTRAINT "FK_04d6ca7794c8f06f614767c4117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" DROP CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" DROP CONSTRAINT "FK_49f4d6046e24075f841f92b045b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_5938be33949ac6364947acbc832"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5265240d723f5f62f5d65363e"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0b21d45e8922181fb4d2ab3ed"`,
    );
    await queryRunner.query(`DROP TABLE "group_chat_banned_members"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3960db0a5030e4f2981fc41021"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b74616bc58646fbb19767e8771"`,
    );
    await queryRunner.query(`DROP TABLE "group_chat_members"`);
    await queryRunner.query(`DROP TABLE "group_members"`);
    await queryRunner.query(`DROP TABLE "group_chats"`);
    await queryRunner.query(`DROP TABLE "group_messages"`);
    await queryRunner.query(`DROP TABLE "private_messages"`);
  }
}
