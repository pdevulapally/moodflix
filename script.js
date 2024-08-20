document.addEventListener("DOMContentLoaded", function () {
    const moodOptions = document.querySelectorAll(".mood-option");
    const movieGrid = document.querySelector(".movie-grid");
    const preferencesForm = document.getElementById("preferences-form");
    const saveButton = preferencesForm.querySelector('button[type="submit"]');
    const languageDropdown = document.getElementById("language");
    const dropdownButton = document.getElementById("dropdownButton");
    const languageSearch = document.getElementById("languageSearch");
    const descriptionContainer = document.createElement("p"); // For dynamic description
    descriptionContainer.style.textAlign = "center";
    descriptionContainer.style.fontSize = "1.2rem";
    movieGrid.parentNode.insertBefore(descriptionContainer, movieGrid); // Insert description above the movie grid

    const shuffleContainer = document.createElement("div"); // Container for the shuffle message and button
    shuffleContainer.style.textAlign = "center";
    shuffleContainer.style.margin = "1rem 0";
    movieGrid.parentNode.insertBefore(shuffleContainer, movieGrid); // Insert shuffle container above the movie grid

    const tmdbApiKey = 'db15001b68f2a22bb24a536a517a14a5';  // Your TMDb API key

    let currentMovies = []; // Store the current list of movies

    // Map moods to genres
    const moodToGenreMap = {
        happy: 35,       // Comedy
        sad: 18,         // Drama
        adventurous: 12, // Adventure
        romantic: 10749, // Romance
        excited: 28,     // Action
        relaxed: 10751,  // Family
        scared: 27,      // Horror
        funny: 35,       // Comedy
        inspiring: 99,   // Documentary
        nostalgic: 10770,// TV Movie
        mysterious: 9648,// Mystery
        uplifting: 14,   // Fantasy
        thrilling: 53,   // Thriller
        sleepy: 10751  
    };

    // Map language codes to full names
    const languageMap = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        zh: "Chinese",
        hi: "Hindi",
        ta: "Tamil",
        te: "Telugu",
        ml: "Malayalam",
        ko: "Korean",
        ja: "Japanese",
        ru: "Russian",
        it: "Italian",
        pt: "Portuguese",
        ar: "Arabic",
        bn: "Bengali",
        pa: "Punjabi",
        tr: "Turkish",
        ur: "Urdu",
        vi: "Vietnamese",
        th: "Thai",
        pl: "Polish",
        uk: "Ukrainian",
        id: "Indonesian",
        ms: "Malay",
        fa: "Persian",
        sv: "Swedish",
        hu: "Hungarian",
        ro: "Romanian",
        nl: "Dutch",
        cs: "Czech",
        fi: "Finnish",
        da: "Danish",
        no: "Norwegian",
        he: "Hebrew",
        el: "Greek",
        sk: "Slovak",
        bg: "Bulgarian",
        sr: "Serbian",
        lt: "Lithuanian",
        lv: "Latvian",
        et: "Estonian",
        sl: "Slovenian",
        hr: "Croatian",
        bs: "Bosnian",
        mk: "Macedonian",
        is: "Icelandic"
    };

    // Load saved preferences
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedAgeGroup = localStorage.getItem('age-group') || 'all';

    // Pre-fill the form with saved preferences
    languageSearch.value = languageMap[savedLanguage];
    document.getElementById('language').value = savedLanguage;
    document.getElementById('age-group').value = savedAgeGroup;

    preferencesForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const language = document.getElementById('language').value;
        const ageGroup = document.getElementById('age-group').value;

        // Save preferences in local storage
        localStorage.setItem('language', language);
        localStorage.setItem('age-group', ageGroup);

        // Display success message
        const successMessage = document.createElement('p');
        successMessage.textContent = "Preferences saved! Now, please select your mood.";
        successMessage.classList.add('success-message');
        preferencesForm.appendChild(successMessage);

        saveButton.disabled = true; // Disable the button

        setTimeout(() => {
            successMessage.remove();
            saveButton.disabled = false; // Re-enable the button
        }, 3000); // Remove the message and reset the button after 3 seconds

        // Scroll to the "Mood Selector" section to prompt the user to select a mood
        document.getElementById("mood-selector").scrollIntoView({ behavior: 'smooth' });
    });

    moodOptions.forEach(option => {
        option.addEventListener("click", () => {
            const mood = option.className.split(" ")[1];
            fetchMoviesByMood(mood);
        });
    });

    async function fetchMoviesByMood(mood) {
        const genreId = moodToGenreMap[mood];
        const languageCode = localStorage.getItem('language') || 'en';
        const ageGroup = localStorage.getItem('age-group') || 'all';
        const languageName = languageMap[languageCode] || 'English';

        // Update the description
        descriptionContainer.textContent = `${languageName} ${capitalizeFirstLetter(mood)} Movies`;

        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genreId}&with_original_language=${languageCode}&sort_by=popularity.desc`;

        // Apply filters based on age group
        if (ageGroup === 'kids') {
            url += '&certification_country=US&certification.lte=G';
        } else if (ageGroup === 'teen') {
            url += '&certification_country=US&certification.lte=PG-13';
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                currentMovies = data.results; // Save the fetched movies
                displayMoviesWithStreaming(currentMovies);
                displayShuffleOption(); // Show shuffle button and message

                // Scroll to the "Recommended Movies" section
                document.getElementById("recommended-movies").scrollIntoView({ behavior: 'smooth' });
            } else {
                movieGrid.innerHTML = `<p>No movies found for mood: ${capitalizeFirstLetter(mood)}</p>`;
                shuffleContainer.innerHTML = ""; // Clear shuffle container if no movies are found
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            movieGrid.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
            shuffleContainer.innerHTML = ""; // Clear shuffle container on error
        }
    }

    async function displayMoviesWithStreaming(movies) {
        if (!movies || movies.length === 0) {
            movieGrid.innerHTML = "<p>No movies to display.</p>";
            return;
        }

        // Clear the current movie grid
        movieGrid.innerHTML = "";

        // Shuffle and limit the results to 10 movies to avoid repetition
        const shuffledMovies = shuffleArray(movies).slice(0, 10);

        for (const movie of shuffledMovies) {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";

            const imagePath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg';

            // Placeholder for streaming data
            const streamingAvailability = await fetchStreamingAvailability(movie.id);

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
            <button id="shuffleButton">Shuffle Movies</button>
        `;

        document.getElementById("shuffleButton").addEventListener("click", () => {
            displayMoviesWithStreaming(currentMovies); // Shuffle and display the movies again
        });
    }

    async function fetchStreamingAvailability(movieId) {
        // Placeholder logic to simulate fetching streaming availability from an API
        // Replace this with a real API call to a service like JustWatch

        // Example: Assume the movie is available on Netflix and Amazon Prime
        const streamingServices = ["Netflix", "Amazon Prime"];

        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return streamingServices.join(", ");
    }

    function shuffleArray(array) {
        // Fisher-Yates shuffle algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Capitalize the first letter of the text
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Language search filter function
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

        // Show the dropdown if the user is typing in the search box
        languageDropdown.classList.remove("hidden");
    };

    // Select language from dropdown
    window.selectLanguage = function (event) {
        const selectedLanguageCode = event.target.value;
        const selectedLanguageName = languageMap[selectedLanguageCode] || selectedLanguageCode;
        languageSearch.value = selectedLanguageName; // Display full language name in search box
        languageDropdown.classList.add("hidden");
        dropdownButton.textContent = "▼";
    };

    // Toggle language dropdown
    dropdownButton.addEventListener("click", () => {
        languageDropdown.classList.toggle("hidden");
        dropdownButton.textContent = languageDropdown.classList.contains("hidden") ? "▼" : "▲";
    });

    // Burger menu toggle
    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");

    burger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        burger.classList.toggle("toggle");
    });

    // Ensure the menu closes when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
            }
        });
    });
});
