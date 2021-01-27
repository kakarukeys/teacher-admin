const { Teacher } = require('../models/Teacher');

const PingController = () => {
  const ping = async (req, res) => {
    await Teacher.findAll({ limit: 1 });
    return res.status(200).json({ pong: true });
  };

  return {
    ping,
  };
};

module.exports = PingController;
