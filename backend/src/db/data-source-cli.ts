import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import entities from './entities';
import migrations from './migrations';

config();

const configService: ConfigService<Record<string, any>> = new ConfigService();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [...entities],
  migrations: [...migrations],
};

const dataSource: DataSource = new DataSource(dataSourceOptions);

export default dataSource;
