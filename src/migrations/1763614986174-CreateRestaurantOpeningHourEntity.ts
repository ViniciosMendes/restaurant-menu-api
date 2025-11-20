import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRestaurantOpeningHourEntity1763614986174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "restaurant_opening_hours" (
            "restaurant_id" INTEGER,
            "day_of_week" VARCHAR(10),
            "opensAt" TIME NOT NULL,
            "closesAt" TIME NOT NULL,
            "isActive" boolean DEFAULT true,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            PRIMARY KEY (restaurant_id, day_of_week),
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "restaurant_opening_hours"`);
    }

}
