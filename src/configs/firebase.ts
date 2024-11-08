// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEu_-nRG99-IhhOmQQ94jXXz5hjnPsqcc",
  authDomain: "refugio-89c1e.firebaseapp.com",
  databaseURL: "https://refugio-89c1e-default-rtdb.firebaseio.com",
  projectId: "refugio-89c1e",
  storageBucket: "refugio-89c1e.appspot.com",
  messagingSenderId: "948076519503",
  appId: "1:948076519503:web:16f6156678d0fb5bbcca3a",
  measurementId: "G-DLJJ5VJT0H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);