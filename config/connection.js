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
  use_env_variable: 'DATABASE_URL',
};

module.exports = {
  development,
  testing,
  production,
};
