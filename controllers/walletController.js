import { walletModel } from '../models/index.js';
import { StatusCodes } from 'http-status-codes';
import transactions from '../middlewares/mongooseTransaction.js';

const createWallet = async (req, res, session) => {
  try {
    const walletExist = await walletModel.findOne({ user: req.user.userId });

    if (!walletExist) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'user do not have wallet!!!' });
    }
    let user = req.user.userId;

    const wallet = new walletModel({ user });

    await wallet.save({ session });

    res.status(StatusCodes.OK).json({
      data: wallet,
      message: 'wallet created successfully',
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getAllUserWallet = async (req, res) => {
  try {
    const usersWallets = await walletModel.find({});
    res.status(StatusCodes.OK).json({ data: usersWallets });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getUserWallet = async (req, res) => {
  const { id } = req.params;
  try {
    const wallet = await walletModel.findOne({ user: req.user.userId, _id: id });

    if (!wallet) {
      return res.status().json({ message: `No user wallet with id : ${id}` });
    }

    res.status(StatusCodes.OK).json({ data: wallet });
  } catch (error) {}
};

export { createWallet, getUserWallet, getAllUserWallet };
