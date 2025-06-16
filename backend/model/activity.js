import mongoose from "mongoose";
const { Schema } = mongoose;

const activitySchema = new Schema({
  type: {
    type: String,
    enum: [
      "expense_added",
      "expense_updated",
      "expense_deleted",
      "payment_made",
      "settlement_done",
    ],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
});

export const Activity = mongoose.model("Activity", activitySchema);
