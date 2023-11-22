import { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleOauth21700609226368 implements MigrationInterface {
  name = 'GoogleOauth21700609226368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileUrl"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_1145146862f40fe12c6d30987c2"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "users_id_seq" OWNED BY "users"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('"users_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_1145146862f40fe12c6d30987c2" FOREIGN KEY ("userEntityId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_1145146862f40fe12c6d30987c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "users_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_1145146862f40fe12c6d30987c2" FOREIGN KEY ("userEntityId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profileUrl" character varying NOT NULL`,
    );
  }
}
