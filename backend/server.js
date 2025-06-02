import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { authMiddleware } from "./middleware/auth.js";
import { Group } from "./model/group.js";
import { User } from "./model/user.js";
import { Expense } from "./model/expenses.js";

dotenv.config();
const mongoURI = process.env.MONGO_URI;
const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Public routes
app.post("/api/users", async (req, res) => {
  try {
    const { firebaseUid, email, displayName } = req.body;
    const user = await User.create({ firebaseUid, email, displayName });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Started authentication middleware
app.use("/api", authMiddleware);

// Get user's profile
app.get("/api/profile", async (req, res) => {
  res.json({ user: req.user });
});

// Get all groups
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await Group.find();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Get group details by ID
app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'displayName email') // Only get displayName and email fields
      .populate('createdBy', 'displayName email');
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
});

// Invite a user to a group
app.post("/api/groups/:groupId/invite", async (req, res) => {
  try {
    const { groupId, inviteeEmail } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const invitee = await User.findOne({ email: inviteeEmail });
    
    // If user exists, add them to the group
    if (invitee) {
      if (group.members.includes(invitee._id)) {
        return res.status(400).json({ error: "User already in group" });
      }
      console.log("user found adding to the group now");
      
      group.members.push(invitee._id);
      await group.save();
      return res.json({ message: "User added to group successfully" });
    }

    // If user doesn't exist, send invitation email
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: inviteeEmail,
      subject: "Join Splitmate Group",
      text: `You have been invited to join the group ${group.name} on Splitmate. Please download the app and accept the invitation.`,
    };

    // Convert sendMail to Promise
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    return res.json({ message: "Invitation email sent successfully" });

  } catch (error) {
    console.error("Error inviting user:", error);
    return res.status(500).json({ error: "Failed to invite user" });
  }
});

// Add a new group
app.post("/api/addGroup", async (req, res) => {
  try {
    // Create the group with the current user as both creator and first member
    const group = new Group({
      name: req.body.name,
      image: req.body.image,
      members: [req.user._id], // Add the creator as the first member
      createdBy: req.user._id,
      totalExpense: 0 // Initialize with 0
    });

    const savedGroup = await group.save();
    
    // Populate the saved group with member details
    const populatedGroup = await Group.findById(savedGroup._id)
      .populate('members', 'displayName email')

    res.status(201).json({ 
      message: "Group added successfully", 
      group: populatedGroup 
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to add group" });
  }
});

// Add an expense to a group
app.post("/api/groups/:groupId/addExpense", async (req, res) => {
  try{
    const {groupId} = req.params;
    const {amount, description} = req.body;

    // Verifying if the group exists
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({error: "Group not found"});
    }
    // Verifying if the user is a member of the group
    if(!group.members.includes(req.user._id)){
      return res.status(403).json({error: "User is not a member of the group"});
    }

    // Creating the expense
    const expense = new Expense({
      groupID: groupId,
      paidBy: req.user._id,
      amount,
      description
    })

    await expense.save();
    group.totalExpense += amount;
    await group.save();

    // Populate the expense with paidBy user's details
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'displayName email')

    res.status(201).json({message: "Expense added successfully", expense});

  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({error: "Failed to add expense"});
  }
})

// Get all expenses for a group
app.get("/api/groups/:groupId/expenses", async (req,res) => {
  try{
    const {groupId} = req.params;
    const expenses = await Expense.find({groupID: groupId})
    .populate('paidBy', 'displayName email')
    .sort({createdAt: -1})

    res.json({expenses});

  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({error: "Failed to fetch expenses"});
  }
})

// Delete a group
app.delete("/api/groups/:groupId", async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.groupId);
    if (!deletedGroup) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// Login route to check if user exists
app.get("/api/auth/login", async (req, res) => {
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
      // User doesn't exist in your database
      return res.status(404).json({
        error: "User not found",
        message: "Please create an account first",
      });
    }

    // Return existing user
    res.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
