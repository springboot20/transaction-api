const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    phone: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 150,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'flutterwave'],
      required: true,
      default: 'stripe',
    },
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'EUR'],
      default: 'NGN',
    },
  },
  { timestamps: true, strictPopulate: false }
);

const transactionModel = model('Transaction', transactionSchema);
module.exports = transactionModel;
