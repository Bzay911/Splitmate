import mongoose from "mongoose";

const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  totalExpense: {
    type: Number,
    default: 0
  },
  members: [{
    name:String,
    phone:String,
  }],
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export const Group = mongoose.model("Group", GroupSchema);

