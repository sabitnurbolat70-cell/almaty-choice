
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// СЕНІҢ FIREBASE ЖОБАҢ
const firebaseConfig = {
  apiKey: "AIzaSyAXJiSM53MnHFMbjJHYGWnx9xMCG4OYthU",
  authDomain: "almaty-choice.firebaseapp.com",
  projectId: "almaty-choice",
  storageBucket: "almaty-choice.firebasestorage.app",
  messagingSenderId: "802340013000",
  appId: "1:802340013000:web:d48517afb9d66fac2636fd",
  measurementId: "G-LCH20EVQC8"
};

// Firebase қосымшасын іске қосу
export const app = initializeApp(firebaseConfig);

// Тіркелу және кіру қызметі
export const auth = getAuth(app);

// Жауаптарды сақтау дерекқоры
export const db = getFirestore(app);