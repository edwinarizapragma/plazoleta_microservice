import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
export default new DataSource({
  type: 'postgres',
  host: process.env.DEV_PG_PLAZA_HOST,
  port: parseInt(process.env.DEV_PG_PLAZA_PORT),
  username: process.env.DEV_PG_PLAZA_USERNAME,
  password: process.env.DEV_PG_PLAZA_PASSWORD,
  database: process.env.DEV_PG_PLAZA_DATABASE,
  entities: [],
  migrationsTableName: 'migrations',
  migrations: ['./database/typeorm/migrations/*.ts'],
  ssl: { rejectUnauthorized: false },
});
