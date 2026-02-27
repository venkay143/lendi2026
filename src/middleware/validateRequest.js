const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(
      apiResponse(false, 'Validation failed', {
        errors: errors.array().map((e) => ({
          field: e.param,
          message: e.msg,
        })),
      })
    );
  }

  return next();
}

module.exports = validateRequest;

