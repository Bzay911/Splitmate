import admin from 'firebase-admin';
import multer from 'multer';
import sharp from 'sharp';
import { Group } from '../../model/group.js';
import { User } from '../../model/user.js';

// Set up multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

  async getSplitmates(req, res) {
    try {
      // Use the already attached req.user from auth middleware
      const currentUser = req.user;
      
      // Find groups where the current user is a member
      const groups = await Group.find({ members: currentUser._id })
        .populate('members', 'displayName email')
        .exec();

      // Extract unique members
      const allMembers = new Map();
      
      groups.forEach(group => {
        group.members.forEach(member => {
          if (!member._id.equals(currentUser._id)) {
            allMembers.set(member._id.toString(), {
              id: member._id,
              name: member.displayName,
              email: member.email
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

  // Upload receipt
  async uploadReceipt(req, res) {
    try {
      // Check if API key is properly set
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not defined in environment variables');
        return res.status(500).json({ success: false, error: 'API key configuration error' });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No receipt image provided' 
        });
      }

      // Optimize image before processing
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 1000, fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Convert to base64
      const base64Image = resizedImageBuffer.toString('base64');
      
      // Call Gemini API for receipt scanning using fetch
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
                    You are a receipt scanning assistant. Extract the following information from this receipt image:
                    - Store/Merchant name
                    - Date of purchase
                    - Total amount
                    - Tax amount (if available)
                    - List of items with prices
                    - Payment method (if available)
                    
                    Format the response as a JSON object with these fields:
                    {
                      "merchant": "string",
                      "date": "YYYY-MM-DD",
                      "total": number,
                      "tax": number,
                      "items": [{"name": "string", "price": number}],
                      "paymentMethod": "string"
                    }
                    
                    Only return the JSON object, nothing else.
                    `
                  },
                  {
                    inline_data: {
                      mime_type: req.file.mimetype,
                      data: base64Image
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 32,
              topP: 1,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      
      // Extract and parse the text response
      const rawText = responseData.candidates[0].content.parts[0].text;
      
      // Handle potential JSON extraction issues
      let jsonStr = rawText;
      if (rawText.includes('{') && rawText.includes('}')) {
        jsonStr = rawText.substring(
          rawText.indexOf('{'),
          rawText.lastIndexOf('}') + 1
        );
      }
      
      const receiptData = JSON.parse(jsonStr);
      
      // Return the structured data
      return res.json({ 
        success: true,
        data: receiptData
      });
      
    } catch (error) {
      console.error('Receipt scanning detailed error:', {
        message: error.message,
        stack: error.stack,
        requestFile: req.file ? 'File exists' : 'No file',
        responseStatus: error.response?.status
      });
      return res.status(500).json({ 
        success: false,
        error: 'Failed to process receipt',
        details: error.message
      });
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
