import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeDeleteOnProfile1700440822259 implements MigrationInterface {
    name = 'CascadeDeleteOnProfile1700440822259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6"`);
        await queryRunner.query(`ALTER TABLE "private_messages" DROP CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6"`);
        await queryRunner.query(`ALTER TABLE "private_messages" DROP CONSTRAINT "FK_5938be33949ac6364947acbc832"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709"`);
        await queryRunner.query(`ALTER TABLE "matchs" DROP CONSTRAINT "FK_7123001954f3800be3a80bf348c"`);
        await queryRunner.query(`ALTER TABLE "matchs" DROP CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_c13c4d476209a7c362d246c7b95"`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_messages" ADD CONSTRAINT "FK_5938be33949ac6364947acbc832" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_messages" ADD CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e" FOREIGN KEY ("friendId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matchs" ADD CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a" FOREIGN KEY ("p1Id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matchs" ADD CONSTRAINT "FK_7123001954f3800be3a80bf348c" FOREIGN KEY ("p2Id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_c13c4d476209a7c362d246c7b95" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92" FOREIGN KEY ("blockedUserId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92"`);
        await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT "FK_c13c4d476209a7c362d246c7b95"`);
        await queryRunner.query(`ALTER TABLE "matchs" DROP CONSTRAINT "FK_7123001954f3800be3a80bf348c"`);
        await queryRunner.query(`ALTER TABLE "matchs" DROP CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709"`);
        await queryRunner.query(`ALTER TABLE "private_messages" DROP CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6"`);
        await queryRunner.query(`ALTER TABLE "private_messages" DROP CONSTRAINT "FK_5938be33949ac6364947acbc832"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6"`);
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354"`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_c13c4d476209a7c362d246c7b95" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocks" ADD CONSTRAINT "FK_d0fd453e72c305e839c3b58bc92" FOREIGN KEY ("blockedUserId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matchs" ADD CONSTRAINT "FK_511eb9a7dc35f5e4f766990373a" FOREIGN KEY ("p1Id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matchs" ADD CONSTRAINT "FK_7123001954f3800be3a80bf348c" FOREIGN KEY ("p2Id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_5fddb789d5bcc335bc6c07f5709" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_867f9b37dcc79035fa20e8ffe5e" FOREIGN KEY ("friendId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_messages" ADD CONSTRAINT "FK_5938be33949ac6364947acbc832" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_messages" ADD CONSTRAINT "FK_96a6220ff2d10d9d43e307616d6" FOREIGN KEY ("receiverId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_3e722a0c61bcb454b30cf04f5b6" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_6c694d1eb78e62cf92dc31e9354" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
