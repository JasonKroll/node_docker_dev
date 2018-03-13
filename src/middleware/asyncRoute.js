// Wrap async controllers for cleaner error handling
const asyncRoutes = (fn) =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

  module.exports = asyncRoutes;
