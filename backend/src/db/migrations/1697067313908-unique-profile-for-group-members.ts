import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueProfileForGroupMembers1697067313908 implements MigrationInterface {
    name = 'UniqueProfileForGroupMembers1697067313908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9854fbe2bacd0a6d662c81408f" ON "group_members" ("profileId", "groupChatId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9854fbe2bacd0a6d662c81408f"`);
    }

}
