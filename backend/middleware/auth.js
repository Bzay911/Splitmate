import jwt from 'jsonwebtoken';
import { User } from "../model/user.js";

const JWT_SECRET = process.env.JWT_SECRET; 

export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }
        const token = authHeader.split('Bearer ')[1];

        // Decode JWT token to get user id and email
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findOne({ _id: decodedToken.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please sign up first.' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}