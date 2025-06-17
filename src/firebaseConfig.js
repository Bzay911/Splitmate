// src/firebaseConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA1Z3XlBpcppGg6x-6ccm1PxlW7h94Pgss",
    authDomain: "splitmate-75726.firebaseapp.com",
    projectId: "splitmate-75726",
    storageBucket: "splitmate-75726.firebasestorage.app",
    messagingSenderId: "908503370224",
    appId: "1:908503370224:web:a74bb013fa43ad27adb535",
    measurementId: "G-4V8701ZG13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
