import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupMemberMuted1698111306564 implements MigrationInterface {
  name = 'GroupMemberMuted1698111306564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members" ADD "isMuted" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP COLUMN "isMuted"`,
    );
  }
}
