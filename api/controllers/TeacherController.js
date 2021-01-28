const _ = require('underscore');
const { Sequelize, QueryTypes } = require('sequelize');
const querystring = require('querystring');

const { Teacher, Student, TeacherStudent } = require('../models/Teacher');
const sequelize = require('../../config/database');
const { wrapRoute } = require('./asyncError');

const TeacherController = () => {
  /* Teacher Administration API */

  const register = wrapRoute(async (req, res, next) => {
    /* register students under a teacher */
    const teacherEmail = req.body.teacher;
    const studentEmails = req.body.students;

    // get teacher id from email
    const teacher = await Teacher.findOne({ attribute: ['id'], where: { email: teacherEmail } });

    if (_.isNull(teacher)) {
      return res.status(400).json({ message: 'teacher email is not registered' });
    }

    // get student ids from emails
    const { count, rows: students } = await Student.findAndCountAll({ attribute: ['id', 'email'], where: { email: studentEmails } });

    if (count !== studentEmails.length) {
      const missing = _.difference(studentEmails, _.pluck(students, 'email')).join(', ');
      return res.status(400).json({ message: `some student emails are not registered: ${missing}` });
    }

    // insert teacher-student relations
    try {
      const newRecords = _.map(students, ({ id }) => ({ TeacherId: teacher.id, StudentId: id }));
      await TeacherStudent.bulkCreate(newRecords);
    } catch (err) { // handle race condition (rare)
      if (!(err instanceof Sequelize.ForeignKeyConstraintError)) {
        return res.status(400).json({ message: 'some emails are being deregistered' });
      }
      return next(err);
    }

    return res.status(204).send();
  });

  const commonStudents = wrapRoute(async (req, res) => {
    /* return common students under teachers */

    // WORKAROUND, express.js won't collect values of same query param,
    // unless we follow their format: teacher[]=....&teacher[]=....
    // but we have our own format, so parse the query string again
    const query = querystring.parse(req._parsedUrl.query); // eslint-disable-line
    const teacherEmails = query.teacher;

    // get teacher ids from emails
    const { count, rows: teachers } = await Teacher.findAndCountAll({ attribute: ['id'], where: { email: teacherEmails } });

    // Derek's query for relation division
    // https://stackoverflow.com/a/7774879
    const whereClause = _.times(count, () => 's.id IN (SELECT StudentId FROM TeacherStudents WHERE TeacherId = ?)').join(' AND ');

    const students = await sequelize.query(`SELECT s.email FROM Students s WHERE ${whereClause} ORDER BY s.email`, {
      replacements: _.pluck(teachers, 'id'),
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ students: _.pluck(students, 'email') });
  });

  const suspend = wrapRoute(async (req, res) => {
    res.status(200).json({ pong: true });
  });

  const retrieveForNotifications = wrapRoute(async (req, res) => {
    res.status(200).json({ pong: true });
  });

  return {
    register,
    commonStudents,
    suspend,
    retrieveForNotifications,
  };
};

module.exports = TeacherController;
