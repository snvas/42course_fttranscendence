import { MigrationInterface, QueryRunner } from 'typeorm';

export class NicknameValidation1695946157486 implements MigrationInterface {
  name = 'NicknameValidation1695946157486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "UQ_a53cb2bff1e60b60dc581f86e06" UNIQUE ("nickname")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "UQ_a53cb2bff1e60b60dc581f86e06"`,
    );
  }
}
