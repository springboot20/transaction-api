/** @format */

import { validateToken } from '../utils/jwt.js';
import * as models from '../models/index.js';
import { tokenResponse } from '../utils/jwt.js';
import { StatusCodes } from 'http-status-codes';

const authenticate = async (req, res, next) => {
  let authHeader = req.headers?.authorization;
  let refreshHeader = req.headers['x-refresh'];

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication Invalid' });
  }

  if (!refreshHeader || !refreshHeader.startsWith('Bearer')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication Invalid' });
  }

  let accessToken = authHeader.split(' ')[1];
  let refreshToken = refreshHeader.split(' ')[1];

  try {
    if (accessToken) {
      const payload = validateToken(accessToken);
      req.user = payload.user;
      return next();
    }
    const payload = validateToken(refreshToken);

    const existingToken = await models.tokenModel.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication Invalid' });
    }

    tokenResponse({
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication Invalid' });
  }
};

export default authenticate;
