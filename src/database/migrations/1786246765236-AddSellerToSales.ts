import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerToSales1786246765236 implements MigrationInterface {
    name = 'AddSellerToSales1786246765236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" ADD "seller_id" uuid`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_fbcb737b3ecc7c968b0dc167122" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_fbcb737b3ecc7c968b0dc167122"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "seller_id"`);
    }

}
