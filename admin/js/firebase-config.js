// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7Tp9IPLbAhAubMbSJUVz9B1Jgsf9kw74",
  authDomain: "wefillit-crm.firebaseapp.com",
  projectId: "wefillit-crm",
  storageBucket: "wefillit-crm.firebasestorage.app",
  messagingSenderId: "2313131305",
  appId: "1:2313131305:web:04de18d6c2ae6947c1d338"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
