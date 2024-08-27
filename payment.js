document.addEventListener("DOMContentLoaded", function() {
    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");
    
    // Toggle the navigation menu on burger click
    burger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        burger.classList.toggle("toggle");
    });

    // Smooth scrolling to sections when clicking on nav links
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Offset for sticky header
                    behavior: "smooth"
                });
            }

            // Close the nav menu on mobile after clicking a link
            if (navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                burger.classList.remove("toggle");
            }
        });
    });

    // Handle active state of pricing plans based on click or hover
    const pricingCards = document.querySelectorAll(".pricing-card");
    
    pricingCards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            pricingCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("active");
        });

        card.addEventListener("click", () => {
            pricingCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
        });
    });
});
