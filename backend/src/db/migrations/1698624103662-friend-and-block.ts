import { MigrationInterface, QueryRunner } from "typeorm";

export class FriendAndBlock1698624103662 implements MigrationInterface {
    name = 'FriendAndBlock1698624103662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "friends" ("id" SERIAL NOT NULL, "profileId" integer, "friendId" integer, CONSTRAINT "PK_65e1b06a9f379ee5255054021e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cbf6fee21ed86e16e040b3e9aa" ON "friends" ("profileId", "friendId") `);
        await queryRunner.query(`CREATE TABLE "blocks" ("id" SERIAL NOT NULL, "profileId" integer, "blockedUserId" integer, CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e" FOREIGN KEY ("friendId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_c13c4d476209a7c362d246c7b95" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92" FOREIGN KEY ("blockedUserId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_c13c4d476209a7c362d246c7b95"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709"`);
        await queryRunner.query(`DROP TABLE "blocks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cbf6fee21ed86e16e040b3e9aa"`);
        await queryRunner.query(`DROP TABLE "friends"`);
    }

}
