import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyt98lV_0EZx3BOZdYSoaPmoJaNmNeTUQ",
  authDomain: "box-fa42e.firebaseapp.com",
  projectId: "box-fa42e",
  storageBucket: "box-fa42e.firebasestorage.app",
  messagingSenderId: "922335121903",
  appId: "1:922335121903:web:c30e567514fdaa3793261a",
  measurementId: "G-RDJF931XQ8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
