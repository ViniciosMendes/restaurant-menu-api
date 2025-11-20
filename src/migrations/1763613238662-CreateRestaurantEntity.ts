import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRestaurantEntity1763613238662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "restaurants" (
            "id" SERIAL PRIMARY KEY,
            "name" VARCHAR(20) NOT NULL,
            "kitchen_type" VARCHAR(50) NOT NULL,
            "city" VARCHAR(30) NOT NULL,
            "uf" VARCHAR(2) NOT NULL,
            "contact" VARCHAR(11) NOT NULL,
            "isActive" boolean DEFAULT true,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "restaurants"`);
    }

}
