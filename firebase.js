import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBb2Rp7641qLOhrj6Us_OVBDQYz8ZJJjXk",
  authDomain: "mathplay-cf79f.firebaseapp.com",
  projectId: "mathplay-cf79f",
  storageBucket: "mathplay-cf79f.firebasestorage.app",
  messagingSenderId: "77328667014",
  appId: "1:77328667014:web:427bd7ae2ba98d8076dc07",
  measurementId: "G-TLTPQTLR10"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);