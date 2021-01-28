/**
 * third party libraries
 */
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const cors = require('cors');

/**
 * server configuration
 */
const config = require('../config');
const dbService = require('./services/db.service');

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

/**
 * express application
 */
const app = express();
const server = http.Server(app);
const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');
const DB = dbService(environment).start();

// use json in request body
app.use(express.json());

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// secure express app
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

// fill routes for express application
app.use('/public', mappedOpenRoutes);
app.use('/api', mappedAuthRoutes);

// default error handling
app.get('*', (req, res) => {
  res.status(404).send({ message: 'API endpoint not found, check your URI and method' });
});

app.use((err, req, res, next) => {
  // if headers already sent, should not handle the error
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(err.status).send({ message: 'JSON parsing error' });
  }

  if (!err.status) {
    console.error(err);
    return res.status(500).send({ message: 'Internal server error' });
  }

  return next(err);
});

server.listen(config.port, () => {
  if (environment !== 'production' && environment !== 'development' && environment !== 'testing') {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    process.exit(1);
  }
  return DB;
});
