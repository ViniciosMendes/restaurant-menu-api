import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateItemsEntity1763613269269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "items" (
            "item_id" SERIAL PRIMARY KEY,
            "section_id" INTEGER NOT NULL,
            "name" VARCHAR(30) NOT NULL,
            "description" VARCHAR(200) NOT NULL,
            "price" NUMERIC(10,2) NOT NULL,
            "isActive" boolean DEFAULT true,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            FOREIGN KEY (section_id)
            REFERENCES sections(section_id)
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "items"`);
    }

}
