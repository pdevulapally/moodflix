// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAAmi6ovITMP8HtNQFLTHhVYSGkUwh0Jzw",
    authDomain: "moodflix-682e5.firebaseapp.com",
    projectId: "moodflix-682e5",
    storageBucket: "moodflix-682e5.firebasestorage.app",
    messagingSenderId: "593455524793",
    appId: "1:593455524793:web:d11a968c4328256db32468",
    measurementId: "G-NKP0TQRKZG"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Email/Password Sign-In
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "moodtunes.html"; // Redirect to homepage
        })
        .catch((error) => {
            showMessage(`Error: ${error.message}`);
        });
});

// Google Sign-In
document.getElementById("googleLoginBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = "moodtunes.html"; // Redirect to homepage
        })
        .catch((error) => {
            showMessage(`Error: ${error.message}`);
        });
});

// Display message
function showMessage(message) {
    const messageArea = document.getElementById("messageArea");
    messageArea.textContent = message;
    messageArea.classList.add("visible");
}
