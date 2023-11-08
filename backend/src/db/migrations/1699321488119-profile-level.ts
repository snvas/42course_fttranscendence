import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileLevel1699321488119 implements MigrationInterface {
  name = 'ProfileLevel1699321488119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "level" integer DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "level"`);
  }
}
