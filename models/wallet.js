import { Schema, model } from 'mongoose';

const walletSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const walletTransactionSchema = new Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    inFlow: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const walletModel = model('Wallet', walletSchema);
const walletTransactionModel = model('WalletTransaction', walletTransactionSchema);

export { walletModel, walletTransactionModel };
