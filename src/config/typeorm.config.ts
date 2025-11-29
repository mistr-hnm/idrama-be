import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config(); 


const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migration/**/*{.ts,.js}')],
  // ssl: { rejectUnauthorized: false },
  synchronize: false, // Never true for migrations in production
  autoLoadEntities: true, // This is specific to NestJS TypeOrmModule and can be included here
};

export default typeOrmConfig;
