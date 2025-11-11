import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateVideoHistoryTable1710474200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "video_type_enum" AS ENUM ('batch', 'script');
        `);

        await queryRunner.query(`
            CREATE TABLE "video_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "prompt" text NOT NULL,
                "videoUrl" text NOT NULL,
                "videoType" "video_type_enum" NOT NULL,
                "settings" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_video_history" PRIMARY KEY ("id"),
                CONSTRAINT "FK_video_history_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
            );

            -- Create index for faster queries by userId and videoType
            CREATE INDEX "IDX_video_history_userId_videoType" ON "video_history" ("userId", "videoType", "createdAt" DESC);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "video_history"`);
        await queryRunner.query(`DROP TYPE "video_type_enum"`);
    }
}