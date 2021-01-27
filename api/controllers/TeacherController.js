const { Teacher } = require('../models/Teacher');

const TeacherController = () => {
  const register = async (req, res) => {
    res.status(200).json({ pong: true });
  };

  const commonStudents = async (req, res) => {
    res.status(200).json({ pong: true });
  };

  const suspend = async (req, res) => {
    res.status(200).json({ pong: true });
  };

  const retrieveForNotifications = async (req, res) => {
    res.status(200).json({ pong: true });
  };

  return {
    register,
    commonStudents,
    suspend,
    retrieveForNotifications,
  };
};

module.exports = TeacherController;
