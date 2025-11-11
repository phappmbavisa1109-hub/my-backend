import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTokensTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tokens (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(255) NOT NULL,
                access_token TEXT NOT NULL,
                credits INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                last_used TIMESTAMP,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uk_project_id UNIQUE (project_id),
                CONSTRAINT uk_access_token UNIQUE (access_token)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tokens`);
    }
}