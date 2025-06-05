import { Expense } from '../../model/expenses.js';
import { Group } from '../../model/group.js';
import { User } from '../../model/user.js';

export const expenseController = {
  // Add expense to group
  async addExpense(req, res) {
    try {
      const { groupId } = req.params;
      const { amount, description } = req.body;

      // Verify group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Verify user is member
      if (!group.members.includes(req.user._id)) {
        return res.status(403).json({ error: "User is not a member of the group" });
      }

      // Calculate split amount
      const splitAmount = amount / group.members.length;

      // Create expense
      const expense = new Expense({
        groupID: groupId,
        paidBy: req.user._id,
        amount,
        description,
        splitBetween: group.members
      });

      await expense.save();

      // Update group total
      group.totalExpense += amount;
      await group.save();

      // Update payer's credit
      await User.findByIdAndUpdate(req.user._id, {
        $push: { expenses: expense._id },
        $inc: { creditAmount: amount - splitAmount }
      });

      // Update other members' debt
      await User.updateMany(
        {
          _id: {
            $in: group.members,
            $ne: req.user._id
          },
        },
        {
          $inc: { debtAmount: splitAmount }
        }
      );

      // Get populated expense
      const populatedExpense = await Expense.findById(expense._id)
        .populate('paidBy', 'displayName email');

      res.status(201).json({ 
        message: "Expense added successfully", 
        expense: populatedExpense 
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      res.status(500).json({ error: "Failed to add expense" });
    }
  },

  // Get group expenses
  async getGroupExpenses(req, res) {
    try {
      const { groupId } = req.params;
      const expenses = await Expense.find({ groupID: groupId })
        .populate('paidBy', 'displayName email')
        .sort({ createdAt: -1 });

      res.json({ expenses });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  }
};
