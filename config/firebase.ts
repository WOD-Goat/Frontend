import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore - getReactNativePersistence is exported from firebase/auth in the React Native bundle at runtime
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
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
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const firestore = getFirestore(app);

export default app;
