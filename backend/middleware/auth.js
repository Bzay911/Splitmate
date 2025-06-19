import admin from "firebase-admin";
import { User } from "../model/user.js";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export async function authMiddleware(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader?.startsWith("Bearer ")){
            return res.status(401).json({error: 'Unauthorized - No token provided'});
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Use findOneAndUpdate with upsert to handle race conditions
        const user = await User.findOneAndUpdate(
            { firebaseUid: decodedToken.uid },
            {
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                displayName: decodedToken.name || 'Anonymous',
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true 
            }
        );
        
        req.user = user;
        next();
    }catch(error){
        console.error('Authentication error:', error);
        return res.status(401).json({error: 'Unauthorized - Invalid token'});
    }
}