import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authMiddleware } from "./middleware/auth.js";
import { connectDB } from "./src/config/database.js";

// Import routes
import expenseRoutes from "./src/routes/expenses.routes.js";
import groupRoutes from "./src/routes/group.routes.js";
import userRoutes from "./src/routes/user.routes.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Basic Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB 
connectDB();


// Public routes
app.use("/api/auth", userRoutes);     

// Protected routes
app.use("/api", authMiddleware);      
app.use("/api/groups", groupRoutes); 
app.use("/api/expenses", expenseRoutes); 

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: "Something went wrong!", 
    message: err.message 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
