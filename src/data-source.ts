// src/data-source.ts
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [process.env.NODE_ENV === "production" ? "dist/models/*.js" : "src/models/*.ts"],
  migrations: [process.env.NODE_ENV === "production" ? "dist/migrations/*.js" : "src/migrations/*.ts"],
});
