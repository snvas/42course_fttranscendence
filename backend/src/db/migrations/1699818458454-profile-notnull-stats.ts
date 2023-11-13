import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileNotnullStats1699818458454 implements MigrationInterface {
  name = 'ProfileNotnullStats1699818458454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "level" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "wins" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "losses" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "draws" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "draws" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "losses" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "wins" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ALTER COLUMN "level" DROP NOT NULL`,
    );
  }
}
