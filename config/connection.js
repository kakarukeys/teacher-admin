const development = {
  database: 'teacher_admin_db',
  username: 'expressjs',
  password: 'abcd1234#',
  host: 'localhost',
  dialect: 'mysql',
};

const testing = {
  database: 'test_teacher_admin_db',
  username: 'expressjs',
  password: 'abcd1234#',
  host: 'localhost',
  dialect: 'mysql',
};

const production = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
};

module.exports = {
  development,
  testing,
  production,
};
