import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isDocker = process.env.DOCKER === 'true';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: isDocker ? process.env.DB_HOST : 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: isDocker ? process.env.DB_USER : 'vigipeconha_user',
  password: isDocker ? process.env.DB_PASSWORD : 'vigipeconha_dev_pass_123',
  database: isDocker ? process.env.DB_NAME : 'vigipeconha_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};
