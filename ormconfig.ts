import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import typeOrmConfig from './src/config/typeorm.config';

const AppDataSource = new DataSource(typeOrmConfig as any);

export default AppDataSource;

