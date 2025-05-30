// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA1Z3XlBpcppGg6x-6ccm1PxlW7h94Pgss",
    authDomain: "splitmate-75726.firebaseapp.com",
    projectId: "splitmate-75726",
    storageBucket: "splitmate-75726.firebasestorage.app",
    messagingSenderId: "908503370224",
    appId: "1:908503370224:web:a74bb013fa43ad27adb535",
    measurementId: "G-4V8701ZG13"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
