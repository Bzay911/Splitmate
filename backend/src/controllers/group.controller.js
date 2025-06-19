import { Group } from '../../model/group.js';
import { User } from '../../model/user.js';
import nodemailer from 'nodemailer';

export const groupController = {

 // Get all groups
async getAllGroups(req, res) {
    try {
        // Find groups where the current user is a member
        const groups = await Group.find({ members: req.user._id })
          .populate('members', 'displayName email')
          .populate('createdBy', 'displayName email')
          .populate('colors', 'colors');
        res.json({ groups });
      } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
      }
},

// Get single group
async getGroupById(req, res){
    try {
        const group = await Group.findById(req.params.groupId)
          .populate('members', 'displayName email') 
          .populate('createdBy', 'displayName email');
        
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }
    
        // Check if the current user is a member of the group
        if (!group.members.some(member => member._id.equals(req.user._id))) {
          return res.status(403).json({ error: "Access denied: You are not a member of this group" });
        }
    
        res.json({ group });
      } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ error: "Failed to fetch group details" });
      }
},

// Create a new group
async createGroup(req, res){
    try {
        // Create the group with the current user as both creator and first member
        const group = new Group({
          name: req.body.name,
          image: req.body.image,
          members: [req.user._id], 
          colors: req.body.colors,
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
}, 

// Add a member to a group
async addMemberToGroup(req, res){
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
          // console.log("user found adding to the group now");
          
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
},

// Delete a group
async deleteGroup(req, res){
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
}
}