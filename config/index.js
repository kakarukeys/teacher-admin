const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');

const config = {
  privateRoutes,
  publicRoutes,
  port: 5000,
};

module.exports = config;
