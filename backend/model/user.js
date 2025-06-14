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
  profilePicture: {
    type: String,
    default: 'https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0=',
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
