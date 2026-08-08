import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786150756122 implements MigrationInterface {
    name = 'InitialSchema1786150756122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document" character varying(14) NOT NULL, "name" character varying(150) NOT NULL, "credit_limit" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_83b2dbc72a3eb0b4abd2efd7ea7" UNIQUE ("document"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_status_enum" AS ENUM('AVAILABLE', 'SOLD')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chassi" character varying(17) NOT NULL, "brand" character varying(100) NOT NULL, "model" character varying(100) NOT NULL, "year" integer NOT NULL, "price" numeric(12,2) NOT NULL, "status" "public"."vehicles_status_enum" NOT NULL DEFAULT 'AVAILABLE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_048ff68a50cc7e29d16dde333cd" UNIQUE ("chassi"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sales_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "status" "public"."sales_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6d36f22c1560f3e431e2cf20ba" UNIQUE ("vehicle_id"), CONSTRAINT "REL_a6d36f22c1560f3e431e2cf20b" UNIQUE ("vehicle_id"), CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."financings_status_enum" AS ENUM('PENDING', 'LIQUIDATED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "financings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sale_id" uuid NOT NULL, "status" "public"."financings_status_enum" NOT NULL DEFAULT 'PENDING', "liquidated_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2b2cf6971d19b4a7bb39027b659" UNIQUE ("sale_id"), CONSTRAINT "REL_2b2cf6971d19b4a7bb39027b65" UNIQUE ("sale_id"), CONSTRAINT "PK_c171e1980d75cab2004820b5be6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_c49d95226945ca3a93584f912ca" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_a6d36f22c1560f3e431e2cf20ba" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financings" ADD CONSTRAINT "FK_2b2cf6971d19b4a7bb39027b659" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financings" DROP CONSTRAINT "FK_2b2cf6971d19b4a7bb39027b659"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_a6d36f22c1560f3e431e2cf20ba"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_c49d95226945ca3a93584f912ca"`);
        await queryRunner.query(`DROP TABLE "financings"`);
        await queryRunner.query(`DROP TYPE "public"."financings_status_enum"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TYPE "public"."sales_status_enum"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_status_enum"`);
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
