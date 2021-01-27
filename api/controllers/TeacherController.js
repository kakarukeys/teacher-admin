const { wrapRoute } = require('./asyncError')
const { Teacher } = require('../models/Teacher');

const TeacherController = () => {
  const register = wrapRoute(async (req, res) => {
    res.status(200).json({ pong: true });
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
