import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDd8IJsHU2cBTi-zMigbKudKC1ANsw8AcE",
  authDomain: "javaproject-b0304.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://javaproject-b0304-default-rtdb.firebaseio.com",
  projectId: "javaproject-b0304",
  storageBucket: "javaproject-b0304.firebasestorage.app",
  messagingSenderId: "136481442699",
  appId: "1:136481442699:web:1e249979f0a72c212cbd8e",
  measurementId: "G-9CDB19E00X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export default app;
