// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAAmi6ovITMP8HtNQFLTHhVYSGkUwh0Jzw",
    authDomain: "moodflix-682e5.firebaseapp.com",
    projectId: "moodflix-682e5",
    storageBucket: "moodflix-682e5.firebasestorage.app",
    messagingSenderId: "593455524793",
    appId: "1:593455524793:web:d11a968c4328256db32468",
    measurementId: "G-NKP0TQRKZG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = "3b7babf26bc44cee9c7261231489b206";
const SPOTIFY_CLIENT_SECRET = "0f116dcdcbe44e5c86701156241a8b83";
let spotifyAccessToken = "";

// Language to Spotify Market Mapping
const languageToMarketMap = {
    en: "US",
    te: "IN",
    hi: "IN",
    es: "ES",
    fr: "FR",
    de: "DE",
    zh: "CN",
    ta: "IN",
    ml: "IN",
    ko: "KR",
    ja: "JP",
    ru: "RU",
    it: "IT",
    pt: "PT",
    ar: "AE",
    bn: "IN",
    ur: "PK",
    vi: "VN",
    th: "TH",
    pl: "PL",
    tr: "TR",
    uk: "UA",
    id: "ID",
};

// Fetch Spotify Access Token
async function fetchSpotifyAccessToken() {
    const url = "https://accounts.spotify.com/api/token";
    const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });
        const data = await response.json();
        spotifyAccessToken = data.access_token;
    } catch (error) {
        console.error("Error fetching Spotify access token:", error);
    }
}

// Initialize Spotify Access Token
fetchSpotifyAccessToken();

// Handle Authentication State
document.addEventListener("DOMContentLoaded", () => {
    const authSection = document.getElementById("authSection");
    const profileDropdown = document.getElementById("profileDropdown");
    const profileTrigger = document.getElementById("profileTrigger");
    const profileMenu = document.getElementById("profileMenu");
    const userAvatar = document.getElementById("userAvatar");
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const logoutBtn = document.getElementById("logoutBtn");
    const savePreferencesBtn = document.getElementById("savePreferences");
    const languageSelect = document.getElementById("language");
    const moodOptions = document.querySelectorAll(".mood-option");
    const preferencesForm = document.getElementById("preferencesForm");

    // Monitor Firebase Auth State
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authSection.classList.add("hidden");
            profileDropdown.classList.remove("hidden");
            userAvatar.src = user.photoURL || "https://via.placeholder.com/40";
            dropdownAvatar.src = user.photoURL || "https://via.placeholder.com/50";
            userName.textContent = user.displayName || "User";
            userEmail.textContent = user.email || "No Email";
            moodOptions.forEach((option) => option.classList.add("enabled"));
        } else {
            authSection.classList.remove("hidden");
            profileDropdown.classList.add("hidden");
            moodOptions.forEach((option) => option.classList.remove("enabled"));
            window.location.href = "login.html";
        }
    });

    // Logout Functionality
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("You have been logged out.");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    });

    // Profile Dropdown Toggle
    profileTrigger.addEventListener("click", () => {
        profileMenu.classList.toggle("active");
    });

    // Close Dropdown on Outside Click
    document.addEventListener("click", (e) => {
        if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.remove("active");
        }
    });

    // Save Language Preference
    savePreferencesBtn.addEventListener("click", () => {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem("preferredLanguage", selectedLanguage);

        const successMessage = document.getElementById("preferencesSuccessMessage");
        if (!successMessage) {
            const message = document.createElement("p");
            message.id = "preferencesSuccessMessage";
            message.textContent = "Preferences saved!";
            message.style.color = "#4CAF50";
            message.style.marginTop = "10px";
            preferencesForm.appendChild(message);
        } else {
            successMessage.textContent = "Preferences saved!";
        }
    });

    // Handle Mood Selection
    moodOptions.forEach((option) => {
        option.addEventListener("click", () => {
            if (!option.classList.contains("enabled")) {
                alert("Please log in to use MoodTunes.");
                return;
            }

            moodOptions.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");

            const mood = option.className.split(" ")[1];
            const language = localStorage.getItem("preferredLanguage") || "en";
            fetchSpotifyPlaylists(mood, language);
        });
    });

    // Fetch Spotify Playlists
    async function fetchSpotifyPlaylists(mood, language) {
        const market = languageToMarketMap[language] || "US";
        const query = `${getLanguageKeyword(language)} ${mood}`;
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
        )}&type=playlist&market=${market}&limit=10`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${spotifyAccessToken}`,
                },
            });
            const data = await response.json();

            if (data.playlists && data.playlists.items.length > 0) {
                displayPlaylists(data.playlists.items);
            } else {
                displayErrorMessage(`No playlists found for mood: ${mood} in ${language}`);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
            displayErrorMessage("Failed to fetch playlists. Please try again.");
        }
    }

    // Display Playlists
    function displayPlaylists(playlists) {
        const musicGrid = document.querySelector(".music-grid");
        musicGrid.innerHTML = "";

        playlists.forEach((playlist) => {
            const musicCard = document.createElement("div");
            musicCard.className = "music-card";

            musicCard.innerHTML = `
                <img src="${playlist.images[0]?.url || 'https://via.placeholder.com/300'}" alt="${playlist.name}">
                <h3>${playlist.name}</h3>
                <p>By ${playlist.owner.display_name}</p>
                <a href="${playlist.external_urls.spotify}" target="_blank" class="spotify-button">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" alt="Spotify Logo" style="width:20px; height:20px; margin-right:5px;">
                    Listen on Spotify
                </a>
            `;
            musicGrid.appendChild(musicCard);
        });
    }

    // Display Error Message
    function displayErrorMessage(message) {
        const musicGrid = document.querySelector(".music-grid");
        musicGrid.innerHTML = `<p style="color: red;">${message}</p>`;
    }

    // Helper Function: Get Language Keyword
    function getLanguageKeyword(language) {
        const languageKeywords = {
            en: "english",
            te: "telugu",
            hi: "hindi",
            es: "spanish",
            fr: "french",
            de: "german",
            zh: "chinese",
            ta: "tamil",
            ml: "malayalam",
            ko: "korean",
            ja: "japanese",
            ru: "russian",
            it: "italian",
            pt: "portuguese",
            ar: "arabic",
            bn: "bengali",
            ur: "urdu",
            vi: "vietnamese",
            th: "thai",
            pl: "polish",
            tr: "turkish",
            uk: "ukrainian",
            id: "indonesian",
        };

        return languageKeywords[language] || "english";
    }
});
