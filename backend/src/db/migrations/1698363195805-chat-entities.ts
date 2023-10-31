import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatEntities1698363195805 implements MigrationInterface {
  name = 'ChatEntities1698363195805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "groupChatId" integer, "senderId" integer, CONSTRAINT "PK_f4b396868f303fa38023b61d742" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members" ("id" SERIAL NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "isMuted" boolean NOT NULL DEFAULT false, "isBanned" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupChatId" integer, "profileId" integer, CONSTRAINT "PK_86446139b2c96bfd0f3b8638852" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9854fbe2bacd0a6d662c81408f" ON "group_members" ("profileId", "groupChatId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "group_chats" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "password" character varying, "visibility" character varying NOT NULL DEFAULT 'public', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, "ownerId" integer, CONSTRAINT "UQ_d84e7bc436eeeccee3b99823293" UNIQUE ("name"), CONSTRAINT "UQ_c1f0801674010ad8908a5405e7a" UNIQUE ("password"), CONSTRAINT "PK_2850524c61524bab74e754a2335" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "private_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "receiverId" integer, CONSTRAINT "PK_1bf7cc91ba0b17389d76f7ad2a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "avatars" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "avatars" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" ADD CONSTRAINT "FK_49f4d6046e24075f841f92b045b" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" ADD CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chats" ADD CONSTRAINT "FK_04d6ca7794c8f06f614767c4117" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_5938be33949ac6364947acbc832" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_5938be33949ac6364947acbc832"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_chats" DROP CONSTRAINT "FK_04d6ca7794c8f06f614767c4117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" DROP CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_messages" DROP CONSTRAINT "FK_49f4d6046e24075f841f92b045b"`,
    );
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "avatars" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "avatars" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(`DROP TABLE "private_messages"`);
    await queryRunner.query(`DROP TABLE "group_chats"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9854fbe2bacd0a6d662c81408f"`,
    );
    await queryRunner.query(`DROP TABLE "group_members"`);
    await queryRunner.query(`DROP TABLE "group_messages"`);
  }
}
