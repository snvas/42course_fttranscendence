import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatMessage1696563096951 implements MigrationInterface {
    name = 'ChatMessage1696563096951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel_messages" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_78c08df85633e14659b3bfcd3b7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "channel_messages"`);
    }

}
