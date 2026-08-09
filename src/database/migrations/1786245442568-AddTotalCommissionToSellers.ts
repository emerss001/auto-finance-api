import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalCommissionToSellers1786245442568 implements MigrationInterface {
    name = 'AddTotalCommissionToSellers1786245442568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" ADD "total_commission" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "commission_amount" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "commission_amount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "total_commission"`);
    }

}
