import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSectionsEntity1763613263224 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sections" (
            "section_id" SERIAL PRIMARY KEY,
            "restaurant_id" INTEGER,
            "name" VARCHAR(30) NOT NULL,
            "description" VARCHAR(200) NOT NULL,
            "isActive" boolean DEFAULT true,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sections"`);
    }

}
