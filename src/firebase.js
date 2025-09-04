// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHwb0vLEpgAxb-XpsnskEa8ja0lG_X7oU",
  authDomain: "habit-tracker-b2c1f.firebaseapp.com",
  projectId: "habit-tracker-b2c1f",
  storageBucket: "habit-tracker-b2c1f.firebasestorage.app",
  messagingSenderId: "726864223134",
  appId: "1:726864223134:web:779d8a6e395bc852bf948f",
  measurementId: "G-2C20EGV8JZ"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);