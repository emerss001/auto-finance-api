import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786244960021 implements MigrationInterface {
    name = 'InitialSchema1786244960021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // A tabela sellers já foi criada na migration anterior
        await queryRunner.query(`ALTER TABLE "sales" ADD "discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "commission_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "commission_amount"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "discount_amount"`);
        // A tabela sellers será dropada na migration anterior
    }

}
