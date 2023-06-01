import { DataSource } from 'typeorm';
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'plazoleta',
  entities: [],
  migrationsTableName: 'migrations',
  migrations: ['./database/typeorm/migrations/*.ts'],
});
