import { userModel, tokenModel } from '../models/index';
import withTransactions from '../middlewares/mongooseTransaction';
import { createUserToken } from '../middlewares/createTokenUser';
import { tokenResponse } from '../utils/jwt';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import sendMail from './emailService';
import bcrypt from 'bcryptjs';

const signup = withTransactions(async (req, res, session) => {
  const { email, ...rest } = req.body;
  try {
    const userExists = await userModel.findOne({ email });

    if (userExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
    }

    const isFirstAccount = (await userModel.countDocuments({})) === 0;
    const isSecondAccount = (await userModel.countDocuments({})) === 1;

    let role = isFirstAccount ? 'admin' : isSecondAccount ? 'sub-admin' : 'user';
    let isAdmin = isFirstAccount;

    const user = new userModel({
      ...rest,
      email,
      role,
      isAdmin,
    });

    await user.save({ session });
    res.status(StatusCodes.OK).json({ message: 'You have successfully created an account' });
  } catch (error) {
    return res.status(StatusCodes.CREATED).json({ message: error.message });
  }
});

const signin = withTransactions(async (req, res, session) => {
  console.log(req.user);

  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide email and password' });
  }

  if (!(await user.comparePasswords(password))) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid password, try again!!!' });
  }

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User do not exist!!' });
  }

  const tokenUser = createUserToken(user);
  let refreshToken = '';

  const existingToken = await tokenModel.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;

    if (!isValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    refreshToken = existingToken.refreshToken;

    let tokens = tokenResponse({ user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({
      user: tokenUser,
      message: 'you have successfully signed in',
      tokens,
    });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req?.headers['user-agent'];
  const ip = req?.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  const tokenDoc = new tokenModel(userToken);
  await tokenDoc.save({ session });

  const tokens = tokenResponse({ user: tokenUser, refreshToken });
  res.status(StatusCodes.OK).json({
    user: tokenUser,
    message: 'you have successfully signed in',
    tokens,
  });
});

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'user not found' });
    }

    const payload = {
      userId: user._id,
      email,
    };

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });

    const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${user._id}/${token}`;

    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset password notification',
      html: `<a href=${resetLink}> Reset Link</a>`,
    };

    sendMail(options);
    res.status(StatusCodes.OK).json({ message: 'Reset link successfully sent to your email ', data: resetLink });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const resetPassword = withTransactions(async (req, res, session) => {
  const { id: userId, token } = req.params;
  const { password } = req.body;
  try {
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'user not found' });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const payload = jsonwebtoken.verify(token, secret);

    const hash = await bcrypt.hash(password, genSalt(10));

    user = await userModel.findOneAndUpdate({ _id: userId }, { $set: { password: hash } }, { new: true });
    await user.save({ session });

    res.status(StatusCodes.OK).json({ message: 'Password reset successfully' });

    return payload;
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

export { signup, signin, forgotPassword, resetPassword };
