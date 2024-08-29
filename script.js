document.addEventListener("DOMContentLoaded", function () {
    const moodOptions = document.querySelectorAll(".mood-option");
    const movieGrid = document.querySelector(".movie-grid");
    const preferencesForm = document.getElementById("preferences-form");
    const saveButton = preferencesForm.querySelector('button[type="submit"]');
    const languageDropdown = document.getElementById("language");
    const dropdownButton = document.getElementById("dropdownButton");
    const languageSearch = document.getElementById("languageSearch");
    const descriptionContainer = document.createElement("p");
    const displaySelected = document.createElement("div");

    descriptionContainer.style.textAlign = "center";
    descriptionContainer.style.fontSize = "1.2rem";
    movieGrid.parentNode.insertBefore(descriptionContainer, movieGrid);

    const shuffleContainer = document.createElement("div");
    shuffleContainer.style.textAlign = "center";
    shuffleContainer.style.margin = "1rem 0";
    movieGrid.parentNode.insertBefore(shuffleContainer, movieGrid);

    const tmdbApiKey = 'db15001b68f2a22bb24a536a517a14a5'; // Replace with your actual TMDb API key
    const watchmodeApiKey = 'THkmzUXaTEk1PQpRIj7GhiP2EgG5u79JsruspEgV'; // Replace with your actual Watchmode API key

    let currentMovies = [];

    const moodToGenreMap = {
        happy: 35, sad: 18, adventurous: 12, romantic: 10749, excited: 28,
        relaxed: 10751, scared: 27, funny: 35, inspiring: 99, nostalgic: 10770,
        mysterious: 9648, uplifting: 14, thrilling: 53, sleepy: 10751,  action: 28,  
        scientific: 878, investigation: 80
    };

    const languageMap = {
        en: "English", es: "Spanish", fr: "French", de: "German", zh: "Chinese",
        hi: "Hindi", ta: "Tamil", te: "Telugu", ml: "Malayalam", ko: "Korean",
        ja: "Japanese", ru: "Russian", it: "Italian", pt: "Portuguese", ar: "Arabic",
        bn: "Bengali", pa: "Punjabi", tr: "Turkish", ur: "Urdu", vi: "Vietnamese",
        th: "Thai", pl: "Polish", uk: "Ukrainian", id: "Indonesian", ms: "Malay",
        fa: "Persian", sv: "Swedish", hu: "Hungarian", ro: "Romanian", nl: "Dutch",
        cs: "Czech", fi: "Finnish", da: "Danish", no: "Norwegian", he: "Hebrew",
        el: "Greek", sk: "Slovak", bg: "Bulgarian", sr: "Serbian", lt: "Lithuanian",
        lv: "Latvian", et: "Estonian", sl: "Slovenian", hr: "Croatian",
        bs: "Bosnian", mk: "Macedonian", is: "Icelandic"
    };

    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedAgeGroup = localStorage.getItem('age-group') || 'all';

    languageSearch.value = languageMap[savedLanguage];
    document.getElementById('language').value = savedLanguage;
    document.getElementById('age-group').value = savedAgeGroup;

    preferencesForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const language = document.getElementById('language').value;
        const ageGroup = document.getElementById('age-group').value;

        localStorage.setItem('language', language);
        localStorage.setItem('age-group', ageGroup);

        const successMessage = document.createElement('p');
        successMessage.textContent = "Preferences saved! Now, please select your mood.";
        successMessage.classList.add('success-message');
        preferencesForm.appendChild(successMessage);

        saveButton.disabled = true;

        setTimeout(() => {
            successMessage.remove();
            saveButton.disabled = false;
        }, 3000);

        document.getElementById("mood-selector").scrollIntoView({ behavior: 'smooth' });
    });

    moodOptions.forEach(option => {
        option.addEventListener("click", () => {
            moodOptions.forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
            const mood = option.className.split(" ")[1];
            fetchMoviesByMood(mood);
        });
    });

    async function fetchMoviesByMood(mood) {
        const genreId = moodToGenreMap[mood];
        const languageCode = localStorage.getItem('language') || 'en';
        const ageGroup = localStorage.getItem('age-group') || 'all';
        const languageName = languageMap[languageCode] || 'English';

        descriptionContainer.textContent = `${languageName} ${capitalizeFirstLetter(mood)} Movies`;

        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreId}&with_original_language=${languageCode}&sort_by=popularity.desc`;

        if (ageGroup === 'kids') {
            url += '&certification_country=US&certification.lte=G';
        } else if (ageGroup === 'teen') {
            url += '&certification_country=US&certification.lte=PG-13';
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                currentMovies = data.results;
                displayMoviesWithStreaming(currentMovies);
                displayShuffleOption();
                document.getElementById("recommended-movies").scrollIntoView({ behavior: 'smooth' });
            } else {
                movieGrid.innerHTML = `<p>No movies found for mood: ${capitalizeFirstLetter(mood)}</p>`;
                shuffleContainer.innerHTML = "";
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            movieGrid.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
            shuffleContainer.innerHTML = "";
        }
    }

    async function fetchStreamingAvailability(movieTitle) {
        try {
            const response = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${watchmodeApiKey}&search_field=name&search_value=${encodeURIComponent(movieTitle)}`);
            const searchData = await response.json();

            if (searchData.title_results && searchData.title_results.length > 0) {
                const movieId = searchData.title_results[0].id;
                const sourceResponse = await fetch(`https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=${watchmodeApiKey}`);
                const sourceData = await sourceResponse.json();

                if (sourceData.length > 0) {
                    return sourceData.map(source => {
                        return `<a href="${source.web_url}" target="_blank">${source.name}</a>`;
                    }).join(', ');
                } else {
                    return "Not available on popular platforms";
                }
            } else {
                return "Not available on popular platforms or too old to watch it on youtube";
            }
        } catch (error) {
            console.error("Error fetching streaming availability:", error);
            return "Failed to load streaming availability";
        }
    }

    async function displayMoviesWithStreaming(movies) {
        if (!movies || movies.length === 0) {
            movieGrid.innerHTML = "<p>No movies to display.</p>";
            return;
        }

        movieGrid.innerHTML = "";

        const shuffledMovies = shuffleArray(movies).slice(0, 10);

        for (const movie of shuffledMovies) {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";

            // Use placeholder image if no poster is available
            const imagePath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image';
            const streamingAvailability = await fetchStreamingAvailability(movie.title);

            movieCard.innerHTML = `
                <img src="${imagePath}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Available on: ${streamingAvailability}</p>
            `;

            movieGrid.appendChild(movieCard);
        }
    }

    function displayShuffleOption() {
        shuffleContainer.innerHTML = `
            <p>Don't like these movies?</p>
            <button id="shuffleButton" class="shuffle-button">Shuffle Movies</button>
        `;

        document.getElementById("shuffleButton").addEventListener("click", () => {
            displayMoviesWithStreaming(currentMovies);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Dropdown Behavior
    languageDropdown.classList.add("hidden"); // Initially hide the dropdown

    // Open dropdown when typing in search box
    languageSearch.addEventListener("input", () => {
        filterLanguages();
        languageDropdown.classList.remove("hidden");
    });

    // Open dropdown on button click
    dropdownButton.addEventListener("click", (event) => {
        event.stopPropagation();
        languageDropdown.classList.toggle("hidden");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!languageSearch.contains(event.target) && !dropdownButton.contains(event.target) && !languageDropdown.contains(event.target)) {
            languageDropdown.classList.add("hidden");
        }
    });

    // Filtering language options based on search input
    window.filterLanguages = function () {
        const filter = languageSearch.value.toLowerCase();
        const options = languageDropdown.getElementsByTagName('option');

        for (let i = 0; i < options.length; i++) {
            const txtValue = options[i].textContent || options[i].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                options[i].style.display = "";
            } else {
                options[i].style.display = "none";
            }
        }

        if (languageSearch.value.trim() === "") {
            languageDropdown.classList.add("hidden");
        }
    };

    // Language selection
    window.selectLanguage = function (event) {
        const selectedLanguageCode = event.target.value;
        const selectedLanguageName = languageMap[selectedLanguageCode] || selectedLanguageCode;
        languageSearch.value = selectedLanguageName;
        languageDropdown.classList.add("hidden");
        dropdownButton.textContent = "▼";
    };

    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");

    burger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        burger.classList.toggle("toggle");
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const tutorialModal = document.getElementById("tutorialModal");
    const tutorialButton = document.getElementById("tutorialButton");
    const closeTutorial = document.getElementById("closeTutorial");
    const tutorialVideo = document.getElementById("tutorialVideo");

    // Check if the user is new
    if (!localStorage.getItem('tutorialSeen')) {
        showTutorial();
    }

    // Show the tutorial modal
    function showTutorial() {
        tutorialModal.style.display = "flex";
        localStorage.setItem('tutorialSeen', 'true');
        tutorialVideo.play(); // Auto-play video when modal opens
    }

    // Hide the tutorial modal
    function hideTutorial() {
        tutorialModal.style.display = "none";
        tutorialVideo.pause(); // Pause video when modal closes
    }

    // Toggle the tutorial modal
    function toggleTutorial() {
        if (tutorialModal.style.display === "flex") {
            hideTutorial();
        } else {
            showTutorial();
        }
    }

    // Event listeners
    tutorialButton.addEventListener("click", toggleTutorial);
    closeTutorial.addEventListener("click", hideTutorial);

    // Close modal when clicking outside of it
    window.addEventListener("click", function(event) {
        if (event.target === tutorialModal) {
            hideTutorial();
        }
    });
});

