import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAndProfileTables1691457248059 implements MigrationInterface {
  name = 'UserAndProfileTables1691457248059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "displayName" character varying NOT NULL, "profileUrl" character varying NOT NULL, "otpEnabled" boolean NOT NULL DEFAULT false, "otpValidated" boolean DEFAULT false, "otpSecret" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("expiredAt" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL, "destroyedAt" TIMESTAMP, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c1989542e47d9e3b98fe32c67" ON "sessions" ("expiredAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "nickname" character varying NOT NULL, "avatar" character varying NOT NULL, "userEntityId" integer, CONSTRAINT "REL_1145146862f40fe12c6d30987c" UNIQUE ("userEntityId"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_1145146862f40fe12c6d30987c2" FOREIGN KEY ("userEntityId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_1145146862f40fe12c6d30987c2"`,
    );
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c1989542e47d9e3b98fe32c67"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
