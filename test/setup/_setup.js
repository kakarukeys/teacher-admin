const express = require('express');
const mapRoutes = require('express-routes-mapper');

const config = require('../../config');
const database = require('../../config/database');

const beforeAction = async () => {
  const testapp = express();
  const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
  const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');

  testapp.use(express.json());
  testapp.use('/public', mappedOpenRoutes);
  testapp.use('/api', mappedAuthRoutes);

  // connecting to test database
  await database.authenticate();

  if (!database.config.database.startsWith('test')) {
    throw new Error('not using test database');
  }

  // recreate all tables
  await database.drop();
  await database.sync().then(() => console.log('Connection to the database has been established successfully'));

  return testapp;
};

const afterAction = async () => {
  await database.close();
};

module.exports = { beforeAction, afterAction };
