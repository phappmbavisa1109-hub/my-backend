import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTokensTable1710474100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tokens',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'project_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'credits',
            type: 'integer',
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'last_used',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_tokens_project_id',
            columnNames: ['project_id'],
          },
          {
            name: 'idx_tokens_status',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );

    // Add trigger to automatically update updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_tokens_updated_at
        BEFORE UPDATE ON tokens
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS update_tokens_updated_at ON tokens');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');
    await queryRunner.dropTable('tokens');
  }
}