import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { Expense } from '../../model/expenses.js';
import { Group } from '../../model/group.js';
import { User } from '../../model/user.js';
import { Activity } from '../../model/activity.js';

dotenv.config();
const gemini_api_key = process.env.GEMINI_API_KEY;

// Set up multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Extract common functionality into reusable functions
const updateGroupTotals = async (groupId, amount) => {
  // Logic to update group total expense
  await Group.findByIdAndUpdate(groupId, {
    $inc: { totalExpense: amount }
  });
};

const updateMemberBalances = async (groupId, paidById, amount, members) => {
  const group = await Group.findById(groupId).populate('members');
  if (!group) return;
  
  const memberCount = members.length || group.members.length;
  const perPersonShare = amount / memberCount;
  
  // Update each member's balance
  for (const memberId of members) {
    if (memberId.toString() === paidById.toString()) {
      // Payer gets credit for what others owe them
      await User.findByIdAndUpdate(memberId, {
        $inc: { creditAmount: amount - perPersonShare }
      });
    } else {
      // Others owe their share
      await User.findByIdAndUpdate(memberId, {
        $inc: { debtAmount: perPersonShare }
      });
    }
  }
};

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

      // update activity
      await Activity.create({
        type: "expense_added",
        actor: req.user._id,
        group: groupId,
        expense: expense._id,
        message: `${req.user.displayName} added an expense "${description}" for $${amount} in ${group.name}`,
      });


      // Use shared functions
      await updateGroupTotals(groupId, amount);
      await updateMemberBalances(groupId, req.user._id, amount, group.members);

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

    // Scan receipt
    async scanReceipt(req, res) {
      try {
        // Check if API key is properly set
        if (!gemini_api_key) {
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
        
        // Initialize Google AI client
        const googleAI = new GoogleGenerativeAI(gemini_api_key);
        const geminiConfig = {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        };
        
        const geminiModel = googleAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          config: geminiConfig
        });
        
        // Create prompt for Gemini
        const promptConfig = [
          {
            text: `
            You are a receipt scanning assistant. Extract the following information from this receipt image:
            - Store/Merchant name which will be the description of the expense
            - If no store/merchant name is present use the first two names of the items from the receipt
            - Date of purchase
            - Total amount
            
            Format the response as a JSON object with these fields:
            {
              "description": "string",
              "date": "YYYY-MM-DD",
              "total": number,
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
        ];
  
        // Call Gemini API
        const result = await geminiModel.generateContent({
          contents: [{role: "user", parts: promptConfig}],
        });
        
        const response = await result.response;
        const responseText = response.text();
        
        console.log("Gemini API Raw Response:", responseText);

        // Extract JSON from response
        let jsonData;
        try {
          // Try to extract JSON if it's wrapped in text
          if (responseText.includes('{') && responseText.includes('}')) {
            const jsonStr = responseText.substring(
              responseText.indexOf('{'),
              responseText.lastIndexOf('}') + 1
            );
            jsonData = JSON.parse(jsonStr);
          } else {
            // If response is already JSON
            jsonData = JSON.parse(responseText);
          }
          
          console.log("Structured Receipt Data:", JSON.stringify(jsonData, null, 2));
          
          // Return the structured data
          return res.json({ 
            success: true,
            data: jsonData
          });
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to parse receipt data',
            rawResponse: responseText
          });
        }
        
      } catch (error) {
        console.error('Receipt scanning detailed error:', {
          message: error.message,
          stack: error.stack,
          requestFile: req.file ? 'File exists' : 'No file'
        });
        return res.status(500).json({ 
          success: false,
          error: 'Failed to process receipt',
          details: error.message
        });
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
