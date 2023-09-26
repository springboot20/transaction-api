import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    role: {
      type: String,
      enum: ['admin', 'user', 'sub-admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = model('User', userSchema);
export default userModel;
