const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(apiResponse(false, 'Authentication token missing', null));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
    return next();
  } catch (error) {
    return res.status(401).json(apiResponse(false, 'Invalid or expired token', null));
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(apiResponse(false, 'Forbidden: insufficient permissions', null));
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};

