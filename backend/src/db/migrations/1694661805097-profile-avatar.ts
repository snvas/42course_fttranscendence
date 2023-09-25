import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileAvatar1694661805097 implements MigrationInterface {
  name = 'ProfileAvatar1694661805097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "avatars" ("id" SERIAL NOT NULL, "filename" character varying NOT NULL, "data" bytea NOT NULL, CONSTRAINT "PK_224de7bae2014a1557cd9930ed7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "avatar"`);
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "wins" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "losses" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "draws" integer DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "profiles" ADD "avatarId" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "avatarId"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "draws"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "losses"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "wins"`);
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "avatar" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "avatars"`);
  }
}
