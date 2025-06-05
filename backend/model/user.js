import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    default: 'Anonymous',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  expenses: [{
    type: Schema.Types.ObjectId,
    ref: "Expense"
  }],
  creditAmount: {
    type: Number,
    default: 0
  },
  debtAmount: {
    type: Number,
    default: 0
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema);
