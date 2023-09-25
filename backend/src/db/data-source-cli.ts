import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService: ConfigService<Record<string, any>> = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: configService.get<number>('DB_PORT') || 5432,
  username: configService.get<string>('DB_USERNAME') || 'root',
  password: configService.get<string>('DB_PASSWORD') || 'root',
  database: configService.get<string>('DB_NAME') || 'transcendence',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  //synchronize: true,
};

const dataSource: DataSource = new DataSource(dataSourceOptions);

export default dataSource;
