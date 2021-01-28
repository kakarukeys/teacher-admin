const _ = require('underscore');
const { Sequelize } = require('sequelize');
const { wrapRoute } = require('./asyncError');
const { Teacher, Student, TeacherStudent } = require('../models/Teacher');

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
    res.status(200).json({ pong: true });
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
