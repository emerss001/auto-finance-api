import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSellersTable1786241733316 implements MigrationInterface {
    name = 'CreateSellersTable1786241733316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sellers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "commission_rate" numeric(5,2) NOT NULL, CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sellers"`);
    }

}
