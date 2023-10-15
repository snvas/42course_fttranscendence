import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupChatCascadeDelete1697413284193 implements MigrationInterface {
    name = 'GroupChatCascadeDelete1697413284193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e"`);
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_49f4d6046e24075f841f92b045b"`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_49f4d6046e24075f841f92b045b" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_messages" DROP CONSTRAINT "FK_49f4d6046e24075f841f92b045b"`);
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e"`);
        await queryRunner.query(`ALTER TABLE "group_messages" ADD CONSTRAINT "FK_49f4d6046e24075f841f92b045b" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_cde9e83a36e5a277b7b23a10a3e" FOREIGN KEY ("groupChatId") REFERENCES "group_chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
