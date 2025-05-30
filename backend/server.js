import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import mongoose from "mongoose";
import { authMiddleware } from "./middleware/auth.js";
import { Group } from "./model/group.js";
import { User } from "./model/user.js";

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
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
});

// Add a new group
app.post("/api/addGroup", async (req, res) => {
  try {
    const group = new Group({
      // name: req.body.name,
      // image: req.body.image,
      // totalExpense: req.body.totalExpense,
      // members: req.body.members,
      ...req.body,
      createdBy: req.user._id,
    });

    const savedGroup = await group.save();
    res
      .status(201)
      .json({ message: "Group added successfully", group: savedGroup });
  } catch (error) {
    res.status(500).json({ error: "Failed to add group" });
  }
});

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
