const jsonwebtoken = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

function validateToken(token) {
  try {
    const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
}

const generateToken = ({ payload, expiresIn }) => {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const tokenResponse = ({ refresh, user }) => {
  const day = 24 * 60 * 60 * 1000;
  const longerDay = 31 * 7 * 24 * 60 * 60 * 1000;

  let accessToken = generateToken({ payload: { user }, expiresIn: `${day}ms` });
  let refreshToken = generateToken({ payload: { user, refresh }, expiresIn: `${longerDay}ms` });

  return { accessToken, refreshToken };
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized to access this route' });
    }
    next();
  };
};

const checkUserPermission = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin' || requestUser.role === 'sub-admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized to access this route' });
};

module.exports = {
  tokenResponse,
  validateToken,
  generateToken,
  authorizePermission,
  checkUserPermission,
};
