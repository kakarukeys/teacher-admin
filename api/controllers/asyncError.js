const wrapRoute = (fn) => async (req, res, next) => {
  try {
    // run controllers logic
    await fn(req, res, next);
  } catch (err) {
    // if an exception is raised, do not send any response
    // just continue performing the middleware chain
    next(err);
  }
};

module.exports = {
  wrapRoute,
};
