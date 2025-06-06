import { User } from '../../model/user.js';
import admin from 'firebase-admin';

export const userController = {
  // Create new user
  async createUser(req, res) {
    try {
      const { firebaseUid, email, displayName } = req.body;
      const user = await User.create({ firebaseUid, email, displayName });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  },

  // Get user profile
  async getProfile(req, res) {
    res.json({ user: req.user });
  },

  // Get user's financial summary
  async getFinancialSummary(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate({
          path: 'expenses',
          populate: {
            path: 'groupID',
            select: 'name'
          }
        });

      const summary = {
        totalExpenses: user.expenses.reduce((sum, expense) => sum + expense.amount, 0),
        creditAmount: user.creditAmount,
        debtAmount: user.debtAmount,
        netBalance: user.creditAmount - user.debtAmount
      };

      res.json({ summary });
    } catch (error) {
      console.error("Error fetching user summary:", error);
      res.status(500).json({ error: "Failed to fetch user summary" });
    }
  },

  // Login check
  async checkLogin(req, res) {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split("Bearer ")[1];

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Find user in your database
      const user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "Please create an account first",
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: "Authentication failed" });
    }
  }
};
