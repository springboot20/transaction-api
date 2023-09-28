import { StatusCodes } from 'http-status-codes'
import { transactionModel, userModel, walletModel } from '../models/index.js'
import transactions from '../middlewares/mongooseTransaction.js'
import moment from 'moment'
import { createWallet } from './walletController.js'
import Stripe from '../helpers/stripeService.js'

const makeTransaction = transactions(async (req, res, session) => {
  req.body.user = req.user.userId;

  const { email, amount, ...rest } = req.body;

  try {
    const user = await userModel.findOne({ email });

    const payment = await Stripe.create

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'user do not found' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

const updateTransaction = transactions(async (req, res, session) => {
  const { id } = req.params;
  try {
    const transactionDoc = await transactionModel.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { $set: req.body },
      { new: true }
    );
    const userDoc = await userModel.findOne({ _id: req.user.userId });

    let transactionIndex = userDoc.transactions.indexOf(id);
    if (transactionIndex === -1) {
      userDoc.transactions.push(transactionDoc._id);
    }

    await transactionDoc.save({ session });
    await userDoc.save({ session });

    res.status(StatusCodes.OK).json({ message: 'transaction successful', transactionDoc });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
});

const monthlyTransaction = async (req, res) => {
  const date = new Date();
  let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  let lastYear = new Date(date.setYear(date.getFullYear() - 1));
  
  try {
    let monthlyTransactions = await transactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $gte: lastYear },
        },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { month: '$year', year: '$year' },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': -1, '_id.year': -1 } },
    ]);

    monthlyTransactions = monthlyTransactions.map((transaction) => {
      const {
        _id: { year, month },
        total,
      } = transaction;

      const date = moment()
        .month(month - 1)
        .year(year)
        .format('DD MMMM YYYY');

      return { date, total };
    });

    res.status(StatusCodes.OK).json({ monthlyTransactions });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const fetchAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.find({}).populate('userId');
    res.status(StatusCodes.OK).json(transactions);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export{ makeTransaction, updateTransaction, monthlyTransaction, fetchAllTransactions };
