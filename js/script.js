document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll("#starRating .star");
    const ratingMessage = document.getElementById("ratingMessage");

    // Check if stars exist on the current page before running code
    if (stars.length > 0) {
        stars.forEach((star, index) => {
            // Mouse enter effect (hover style change)
            star.addEventListener("mouseenter", function () {
                resetStars();
                highlightStars(index + 1, "hovered");
            });

            // Mouse leave effect
            star.addEventListener("mouseleave", function () {
                resetStars();
                // Restore selection if already rated
                const currentRating = document.querySelector("#starRating").getAttribute("data-rating");
                if (currentRating) {
                    highlightStars(currentRating, "selected");
                }
            });

            // Click event to save rating and dynamically change text/styles
            star.addEventListener("click", function () {
                const ratingValue = index + 1;
                // Store rating data attribute on container
                document.querySelector("#starRating").setAttribute("data-rating", ratingValue);
                
                resetStars();
                highlightStars(ratingValue, "selected");

                // Dynamically modify text content based on user interaction
                ratingMessage.textContent = `Thank you for rating us ${ratingValue} out of 5 stars!`;
            });
        });
    }

    function highlightStars(count, className) {
        stars.forEach((s, i) => {
            if (i < count) {
                s.classList.add(className);
            }
        });
    }

    function resetStars() {
        stars.forEach(s => {
            s.classList.remove("hovered", "selected");
        });
    }
});
var colorBtn = document.getElementById("colorBtn");

if (colorBtn) {
    colorBtn.addEventListener("click", function () {
        // Toggle a 'dark-mode' class on the body
        document.body.classList.toggle("dark-mode");
        
        // Optional: change button text depending on the current mode
        if (document.body.classList.contains("dark-mode")) {
            colorBtn.textContent = "Day Mode";
        } else {
            colorBtn.textContent = "Change Background";
        }
    });
}