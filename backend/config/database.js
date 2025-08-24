const knex = require('knex');
require('dotenv').config();

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    migrations: {
      directory: '../migrations',
    },
    seeds: {
      directory: '../seeds',
    },
    useNullAsDefault: true,
  },
  
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite3',
    },
    migrations: {
      directory: '../migrations',
    },
    seeds: {
      directory: '../seeds',
    },
    useNullAsDefault: true,
  },
  
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: '../migrations',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const db = knex(dbConfig);

module.exports = db;
