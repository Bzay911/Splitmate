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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  colors: {
    type: [String, String],
    default: null
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export const Group = mongoose.model("Group", GroupSchema);

