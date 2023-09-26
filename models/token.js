import { Schema, model } from 'mongoose';

const refreshSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const tokenModel = model('Refresh', refreshSchema);
export default tokenModel;
