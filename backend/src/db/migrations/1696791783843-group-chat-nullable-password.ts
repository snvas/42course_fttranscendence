import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupChatNullablePassword1696791783843 implements MigrationInterface {
    name = 'GroupChatNullablePassword1696791783843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "group_chats" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_chats" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD "status" character varying NOT NULL`);
    }

}
