import admin from 'firebase-admin';
import { Activity } from '../../model/activity.js';
import { Group } from '../../model/group.js';
import { User } from '../../model/user.js';


export const userController = {
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

  async getSplitmates(req, res) {
    try {
      // Use the already attached req.user from auth middleware
      const currentUser = req.user;
      
      // Find groups where the current user is a member and populate members with profilePicture
      const groups = await Group.find({ members: currentUser._id })
        .populate('members', 'displayName email profilePicture')
        .exec();

      // Extract unique members
      const allMembers = new Map();
      
      groups.forEach(group => {
        group.members.forEach(member => {
          if (!member._id.equals(currentUser._id)) {
            allMembers.set(member._id.toString(), {
              id: member._id,
              name: member.displayName,
              email: member.email,
              image: member.profilePicture || null // Return null if no profile picture
            });
          }
        });
      });
      
      const splitmates = Array.from(allMembers.values());
      res.json({ splitmates });
    } catch (error) {
      console.error("Error fetching splitmates:", error);
      res.status(500).json({ error: "Failed to fetch splitmates" });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { displayName, profilePicture } = req.body;
      const user = await User.findByIdAndUpdate(req.user._id, { displayName, profilePicture }, { new: true });
      res.json({ user });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },


  //get user activity
  async getActivity(req, res) {
    try {
      const currentUser = req.user;

      // Get all groups the user is a member of
      const groups = await Group.find({ members: currentUser._id })
        .populate('members', 'displayName');

      // Get all member IDs
      const memberIds = groups.reduce((ids, group) => {
        group.members.forEach(member => {
          ids.add(member._id.toString());
        });
        return ids;
      }, new Set()); // We are creating a set because we want to avoid duplicates

      // Get all activities for these members in one query
      const activities = await Activity.find({
        actor: { $in: Array.from(memberIds) }
      })
      .populate('actor', 'displayName')
      .populate('group', 'name')
      .populate('expense', 'amount description')
      .sort({ timestamp: -1 }) // Sort by most recent
      .exec();

      res.json({ activities });
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
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
