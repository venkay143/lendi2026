const apiResponse = require('../utils/apiResponse');

function notFoundHandler(req, res, next) {
  res.status(404).json(apiResponse(false, 'Route not found', null));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Generic error logging; in production, plug into a logger like Winston
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json(
    apiResponse(false, message, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null)
  );
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

