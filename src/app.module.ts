import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DEV_PG_PLAZA_HOST,
      port: parseInt(process.env.DEV_PG_PLAZA_PORT),
      username: process.env.DEV_PG_PLAZA_USERNAME,
      password: process.env.DEV_PG_PLAZA_PASSWORD,
      database: process.env.DEV_PG_PLAZA_DATABASE,
      entities: [],
      synchronize: false,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
