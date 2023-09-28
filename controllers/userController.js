import { userModel } from '../models/index.js';
import withTransactions from '../middlewares/mongooseTransaction.js';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import { checkUserPermission } from '../utils/jwt.js';

async function hashPassword(enteredPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(enteredPassword, salt);
}

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await userModel.find({ role: 'user' }).select('-password').exec();
  res.status(StatusCodes.OK).json({ data: users });
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select('-password').populate('transactions wallet').exec();
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'user not found' });
    }

    if (user && user._id) {
      checkUserPermission(req.user, user._id);
    }

    res.status(StatusCodes.OK).json({ data: user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateUser = withTransactions(async (req, res, session) => {
  const { id } = req.params;

  if (req.body.password) {
    req.body.password = await hashPassword(req.body.password);
  }

  try {
    const updateUserDoc = await userModel.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    await updateUserDoc.save({ session });
    res.status(StatusCodes.OK).json({ data: updateUserDoc });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

const userStatistics = async (req, res) => {
  const date = new Date();
  let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  let lastYear = new Date(date.setYear(date.getFullYear() - 1));

  try {
    let usersStats = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $gte: lastYear },
          role: 'user',
        },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          role: '$role',
        },
      },
      {
        $group: {
          _id: { month: '$month', year: '$year', role: '$role' },
          totalUser: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': -1, '_id.year': -1 } },
      { $limit: 6 },
    ]);

    usersStats = usersStats
      .map((items) => {
        const {
          _id: { month, year, role },
          totalUser,
        } = items;
        const date = moment()
          .month(month - 1)
          .year(year)
          .format('DD MMMM YYYY');

        return { date, totalUser, role };
      })
      .reverse();
    res.status(StatusCodes.OK).json({ data: usersStats });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export { getAllUsers, getUser, updateUser, userStatistics };
