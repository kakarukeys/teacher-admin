const _ = require('underscore');
const { body, query, validationResult } = require('express-validator');

// create a line message from express validator's error object
const genErrMsg = (errors) => _.map(errors.array(), ({ msg, param, location }) => `${msg} for ${param} in ${location}`).join(', ');

const validationResultHandler = (req, res, next) => {
  /* handle validation error by sending appropriate response */
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({ message: genErrMsg(errors) });
  }
};

const privateRoutes = {
  'POST /register': {
    path: 'TeacherController.register',
    middlewares: [
      body('teacher').isEmail().normalizeEmail(),
      body('students').notEmpty(),
      body('students.*').isEmail().normalizeEmail(),
      validationResultHandler,
    ],
  },
  'GET /commonstudents': {
    path: 'TeacherController.commonStudents',
    middlewares: [
      query('teacher').isEmail().normalizeEmail(),
      query('teacher.*').isEmail().normalizeEmail(),
      validationResultHandler,
    ],
  },
  'POST /suspend': {
    path: 'TeacherController.suspend',
    middlewares: [
      body('student').isEmail().normalizeEmail(),
      validationResultHandler,
    ],
  },
  'POST /retrievefornotifications': {
    path: 'TeacherController.retrieveForNotifications',
    middlewares: [
      body('teacher').isEmail().normalizeEmail(),
      body('notification').isString(),
      validationResultHandler,
    ],
  },
};

module.exports = privateRoutes;
