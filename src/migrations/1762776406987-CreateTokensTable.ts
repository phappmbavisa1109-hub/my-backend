import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTokensTable1762776406987 implements MigrationInterface {
    name = 'CreateTokensTable1762776406987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_tokens_project_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tokens_status"`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "project_id"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "project_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "access_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "status" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "status" character varying(50) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "access_token" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "project_id"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "project_id" character varying(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_tokens_status" ON "tokens" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_tokens_project_id" ON "tokens" ("project_id") `);
    }

}
