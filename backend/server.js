import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { Group } from './model/group.js';

dotenv.config();
const mongoURI = process.env.MONGO_URI;
const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Get all groups
app.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group details by ID
app.get('/groups/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Add a new group
app.post('/addGroup', async (req, res) => {
  try {
    const group = new Group({
      name: req.body.name,
      image: req.body.image,
      totalExpense: req.body.totalExpense,
      members: req.body.members,
    });
    
    const savedGroup = await group.save();
    res.status(201).json({ message: "Group added successfully", group: savedGroup });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add group' });
  }
});

// Delete a group
app.delete('/groups/:groupId', async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.groupId);
    if (!deletedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
