// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Thay thế các giá trị này bằng config từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBW01TzaqT1cNJoHN-SLgO21X_0fi4aX6g",
  authDomain: "meow-cloud-auth.firebaseapp.com",
  projectId: "meow-cloud-auth",
  storageBucket: "meow-cloud-auth.firebasestorage.app",
  messagingSenderId: "345689108924",
  appId: "1:345689108924:web:2b73bbe981b369e9693bb9",
  measurementId: "G-KCK7BFQM88"
};

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Export auth instance để dùng ở các nơi khác
export const auth = getAuth(app);
export const db = getFirestore(app);
