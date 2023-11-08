import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchEntity1699400008486 implements MigrationInterface {
  name = 'MatchEntity1699400008486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "matchs" ("id" character varying NOT NULL, "p1Joined" boolean NOT NULL DEFAULT false, "p2Joined" boolean NOT NULL DEFAULT false, "p1Score" integer NOT NULL DEFAULT '0', "p2Score" integer NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'waitingPlayers', "winner" character varying NOT NULL DEFAULT 'draw', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "p1Id" integer, "p2Id" integer, CONSTRAINT "PK_0fdbc8e05ccfb9533008b132189" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "matchs" ADD CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a" FOREIGN KEY ("p1Id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matchs" ADD CONSTRAINT "FK_7123001954f3800be3a80bf348c" FOREIGN KEY ("p2Id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matchs" DROP CONSTRAINT "FK_7123001954f3800be3a80bf348c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matchs" DROP CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a"`,
    );
    await queryRunner.query(`DROP TABLE "matchs"`);
  }
}
