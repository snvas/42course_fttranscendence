import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFuckingDraws1699826856804 implements MigrationInterface {
    name = 'RemoveFuckingDraws1699826856804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "draws"`);
        await queryRunner.query(`ALTER TABLE "matchs" ALTER COLUMN "winner" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matchs" ALTER COLUMN "winner" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matchs" ALTER COLUMN "winner" SET DEFAULT 'draw'`);
        await queryRunner.query(`ALTER TABLE "matchs" ALTER COLUMN "winner" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "draws" integer NOT NULL DEFAULT '0'`);
    }

}
