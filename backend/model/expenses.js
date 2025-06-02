import mongoose from "mongoose";
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
    groupID: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    paidBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    splitBetween: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    status:{
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    }
}, {
    timestamps: true
})

export const Expense = mongoose.model("Expense", ExpenseSchema);