import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupMemberFlags1698106751612 implements MigrationInterface {
    name = 'GroupMemberFlags1698106751612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" ADD "isMuted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD "isBanned" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "isBanned"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "isMuted"`);
    }

}
