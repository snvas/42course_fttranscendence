import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrivateChat1696707924258 implements MigrationInterface {
  name = 'PrivateChat1696707924258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "private_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "receiverId" integer, CONSTRAINT "PK_1bf7cc91ba0b17389d76f7ad2a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_5938be33949ac6364947acbc832" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" ADD CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_messages" DROP CONSTRAINT "FK_5938be33949ac6364947acbc832"`,
    );
    await queryRunner.query(`DROP TABLE "private_messages"`);
  }
}
