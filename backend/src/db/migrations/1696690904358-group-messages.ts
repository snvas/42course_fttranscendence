import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupMessages1696690904358 implements MigrationInterface {
    name = 'GroupMessages1696690904358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "group_messages" ("id" SERIAL NOT NULL, "group_id" integer NOT NULL, "sender_id" integer NOT NULL, "sender_name" character varying NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4b396868f303fa38023b61d742" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "group_messages"`);
    }

}
