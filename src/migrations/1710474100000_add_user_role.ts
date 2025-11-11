import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRole1710474100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "role" varchar(50) NOT NULL DEFAULT 'user'
        `);

        // Set admin role for admin@admin.com
        await queryRunner.query(`
            UPDATE "users"
            SET "role" = 'admin'
            WHERE "email" = 'admin@admin.com'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "role"
        `);
    }
}