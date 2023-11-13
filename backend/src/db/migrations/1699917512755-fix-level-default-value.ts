import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLevelDefaultValue1699917512755 implements MigrationInterface {
    name = 'FixLevelDefaultValue1699917512755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "level" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "level" SET DEFAULT '1'`);
    }

}
