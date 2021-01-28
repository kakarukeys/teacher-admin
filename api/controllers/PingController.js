const { wrapRoute } = require('./asyncError');
const { Teacher } = require('../models/Teacher');

const PingController = () => {
  /* ping-pong API for load balancer to monitor service's health */

  const ping = wrapRoute(async (req, res) => {
    await Teacher.findAll({ limit: 1 });
    return res.status(200).json({ pong: true });
  });

  return {
    ping,
  };
};

module.exports = PingController;
