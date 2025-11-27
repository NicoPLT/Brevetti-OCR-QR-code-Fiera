import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTyXW7Zph9IMRUJm2KW2JuIrAB09kBdb8",
  authDomain: "brevetti-fiera-crm.firebaseapp.com",
  projectId: "brevetti-fiera-crm",
  storageBucket: "brevetti-fiera-crm.firebasestorage.app",
  messagingSenderId: "696385697226",
  appId: "1:696385697226:web:3100e0c4efc0bac9c48b33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);