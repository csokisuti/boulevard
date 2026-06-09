import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3IwzTXjnZqQwuvHAYitHdJRTUX81aiS4",
  authDomain: "boulevard-b001b.firebaseapp.com",
  projectId: "boulevard-b001b",
  storageBucket: "boulevard-b001b.firebasestorage.app",
  messagingSenderId: "712850755413",
  appId: "1:712850755413:web:b2732f37ab9b33efc529dc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };