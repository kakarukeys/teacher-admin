const _ = require('underscore');
const validator = require('validator');
const { QueryTypes } = require('sequelize');
const querystring = require('querystring');

const { Teacher, Student, TeacherStudent } = require('../models/Teacher');
const sequelize = require('../../config/database');
const { wrapRoute } = require('./asyncError');

const parseNotificationEmails = (notiff) => {
  /* return an array of mentioned emails in a notification */
  // [whitespace or beginning]@[EMAIL PATTERN][whitespace or end]
  const mentions = notiff.match(/(?<=(^|\s)@)[^@\s]+@[^@\s]+(?=($|\s))/g);
  return _.filter(mentions, (m) => validator.isEmail(m));
};

const TeacherController = () => {
  /* Teacher Administration API */

  const register = wrapRoute(async (req, res) => {
    /* register students under a teacher */
    const teacherEmail = req.body.teacher;
    const studentEmails = req.body.students;

    await sequelize.transaction(async (t) => {
      // get teacher id from email
      const teacher = await Teacher.findOne({
        attribute: ['id'],
        where: { email: teacherEmail },
        transaction: t,
      });

      if (_.isNull(teacher)) {
        return res.status(400).json({ message: 'teacher email is not registered' });
      }

      // get student ids from emails
      const { count, rows: students } = await Student.findAndCountAll({
        attribute: ['id', 'email'],
        where: { email: studentEmails },
        transaction: t,
      });

      if (count !== studentEmails.length) {
        const missing = _.difference(studentEmails, _.pluck(students, 'email')).join(', ');
        return res.status(400).json({ message: `some student emails are not registered: ${missing}` });
      }

      // insert teacher-student relations
      const newRecords = _.map(students, ({ id }) => ({ TeacherId: teacher.id, StudentId: id }));
      await TeacherStudent.bulkCreate(newRecords, { ignoreDuplicates: true, transaction: t });
      return res.status(204).send();
    });
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

    if (count === 0) {
      return res.status(400).json({ message: 'at least one registered teacher email is required' });
    }

    // Derek's query for relational division
    // https://stackoverflow.com/a/7774879
    const whereClause = _.times(count, () => 's.id IN (SELECT StudentId FROM TeacherStudents WHERE TeacherId = ?)').join(' AND ');

    const students = await sequelize.query(`SELECT s.email FROM Students s WHERE ${whereClause} ORDER BY s.email`, {
      replacements: _.pluck(teachers, 'id'),
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ students: _.pluck(students, 'email') });
  });

  const suspend = wrapRoute(async (req, res) => {
    /* suspend a student */
    const studentEmail = req.body.student;

    // get student id from email
    const student = await Student.findOne({ attribute: ['id', 'suspended'], where: { email: studentEmail } });

    if (_.isNull(student)) {
      return res.status(400).json({ message: 'student email is not registered' });
    }

    if (!student.suspended) {
      student.suspended = true;
      await student.save();
    }

    return res.status(204).send();
  });

  const retrieveForNotifications = wrapRoute(async (req, res) => {
    /* return a list of students who can receive a notification */
    const teacherEmail = req.body.teacher;
    const notiff = req.body.notification;

    await sequelize.transaction(async (t) => {
      // get teacher id from email
      const teacher = await Teacher.findOne({
        attribute: ['id'],
        where: { email: teacherEmail },
        transaction: t,
      });

      if (_.isNull(teacher)) {
        return res.status(400).json({ message: 'teacher email is not registered' });
      }

      const emails = parseNotificationEmails(notiff);

      let emailClause;
      const replacements = { teacherId: teacher.id };

      if (_.isEmpty(emails)) {
        emailClause = '';
      } else {
        emailClause = 'OR s.email IN (:emails)';
        replacements.emails = emails;
      }

      // MUST NOT be suspended,
      // AND MUST fulfill AT LEAST ONE of the following:
      //     is registered with the notiff's teacher (valid)
      //     has been @mentioned in the notification
      const query = `
      SELECT s.email 
      FROM Students s LEFT JOIN TeacherStudents ts ON
        s.id = ts.StudentId
      WHERE NOT s.suspended AND (
        ts.TeacherId = :teacherId ${emailClause}
      )
      ORDER BY s.email`;

      const students = await sequelize.query(
        query,
        { replacements, type: QueryTypes.SELECT, transaction: t },
      );

      return res.status(200).json({
        recipients: _.pluck(students, 'email'),
      });
    });
  });

  return {
    register,
    commonStudents,
    suspend,
    retrieveForNotifications,
  };
};

module.exports = TeacherController;
