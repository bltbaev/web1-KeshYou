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
// ASSIGNMENT 5: TASK 2 + TASK 3
// Separate file so the existing script.js is not changed.
// Every feature checks that its elements exist, so this file is safe on any page.

// ===== 1. Data (Task 3: objects and methods) =====

// Factory function: builds a recipe object that has its own methods
function createRecipe(icon, name, category, minutes) {
    return {
        icon: icon,
        name: name,
        category: category,
        minutes: minutes,
        // Method: returns a text description of the recipe
        getInfo: function () {
            return this.minutes + " min | " + this.category;
        },
        // Method: true when the recipe is fast to cook
        isQuick: function () {
            return this.minutes <= 30;
        }
    };
}

// Task 3: array of objects
const recipes = [
    createRecipe("🥞", "Kefir Pancakes", "breakfast", 20),
    createRecipe("🍳", "Cheese Omelette", "breakfast", 10),
    createRecipe("🥣", "Oatmeal with Fruit", "breakfast", 15),
    createRecipe("🍲", "Borscht", "lunch", 90),
    createRecipe("🥗", "Chicken Salad", "lunch", 25),
    createRecipe("🍕", "Homemade Pizza", "lunch", 45),
    createRecipe("🍖", "Beshbarmak", "dinner", 150),
    createRecipe("🥩", "Juicy Steak", "dinner", 25),
    createRecipe("🐟", "Baked Salmon", "dinner", 30),
    createRecipe("🍝", "Lasagna", "dinner", 70),
    createRecipe("🍰", "San Sebastian Cheesecake", "dessert", 60),
    createRecipe("🍩", "Baursak", "dessert", 40)
];

// ===== 2. DOM elements =====
const dayGreeting = document.getElementById("dayGreeting");
const timeBtn = document.getElementById("timeBtn");
const timeOutput = document.getElementById("timeOutput");
const filterButtons = document.getElementById("filterButtons");
const recipeList = document.getElementById("recipeList");
const recipeCount = document.getElementById("recipeCount");
const chefForm = document.getElementById("chefForm");
const chefMessage = document.getElementById("chefMessage");
const navLinks = Array.from(document.querySelectorAll("#siteNav .nav-link"));

// ===== 3. Functions =====

// Task 3 (sound): one tone at a time, so sounds never overlap
let audioContext = null;
let currentTone = null;

function playSound(type) {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }
        if (!audioContext) {
            audioContext = new AudioContextClass();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        // Stop the previous sound before starting a new one
        if (currentTone) {
            currentTone.stop();
        }

        const tone = audioContext.createOscillator();
        const volume = audioContext.createGain();
        tone.frequency.value = type === "success" ? 880 : 520;
        volume.gain.value = 0.1;
        tone.connect(volume);
        volume.connect(audioContext.destination);
        tone.start();
        tone.stop(audioContext.currentTime + 0.15);
        currentTone = tone;
    } catch (error) {
        // Sound is only a bonus. If the browser blocks it, the page still works.
    }
}

// Task 3 (animation): replay a CSS animation by re-adding its class
function restartAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth; // forces the browser to restart the animation
    element.classList.add(className);
}

// Task 2 (switch statement): different greeting for each part of the day
function showGreeting() {
    const hour = new Date().getHours();
    let message;

    switch (true) {
        case hour < 5:
            message = "Late night? A sweet dessert is always a good idea.";
            break;
        case hour < 12:
            message = "Good morning! How about fluffy pancakes for breakfast?";
            break;
        case hour < 18:
            message = "Good afternoon! Time for a hearty lunch.";
            break;
        default:
            message = "Good evening! Beshbarmak for dinner?";
    }

    dayGreeting.textContent = message;
}

// Task 2 (button listener): show the current time
function showCurrentTime() {
    timeOutput.textContent = "Current time: " + new Date().toLocaleTimeString();
    restartAnimation(timeOutput, "flash");
    playSound("click");
}

// Task 3 (higher-order function): filter() takes a function as an argument
function filterRecipes(category) {
    if (category === "all") {
        return recipes;
    }
    return recipes.filter(function (recipe) {
        return recipe.category === category;
    });
}

// Task 3 (loop): build one card for every recipe in the list
function renderRecipes(list) {
    recipeList.textContent = "";

    for (let i = 0; i < list.length; i++) {
        const card = document.createElement("div");
        card.className = "recipe-item";
        card.style.animationDelay = i * 0.06 + "s";

        const title = document.createElement("h4");
        title.textContent = list[i].icon + " " + list[i].name;

        const info = document.createElement("p");
        info.textContent = list[i].getInfo();

        card.append(title, info);
        recipeList.appendChild(card);
    }

    // Task 3 (higher-order functions): count the quick recipes with filter()
    const quickCount = list.filter(function (recipe) {
        return recipe.isQuick();
    }).length;
    recipeCount.textContent = list.length + " recipes shown, " + quickCount + " ready in 30 minutes or less";
}

// Task 2 (callback): sendMessage() calls onSuccess or onError when fetch finishes
function sendMessage(data, onSuccess, onError) {
    fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Server error " + response.status);
            }
            return response.json();
        })
        .then(onSuccess)
        .catch(onError);
}

function showFormMessage(text, className) {
    chefMessage.textContent = text;
    chefMessage.className = "chef-message " + className;
}

function handleFormSubmit(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("chefName").value.trim(),
        email: document.getElementById("chefEmail").value.trim(),
        question: document.getElementById("chefQuestion").value.trim()
    };

    // Validation
    if (data.name === "" || data.question === "") {
        showFormMessage("Please enter your name and your question.", "error-text");
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        showFormMessage("Please enter a valid email.", "error-text");
        return;
    }

    const submitBtn = document.getElementById("chefSubmit");
    submitBtn.disabled = true;
    showFormMessage("Sending...", "");

    // The two functions below are the callbacks
    sendMessage(
        data,
        function () {
            showFormMessage("Thank you, " + data.name + "! The chef got your question.", "success");
            chefForm.reset();
            submitBtn.disabled = false;
            playSound("success");
        },
        function () {
            showFormMessage("Something went wrong. Please try again.", "error-text");
            submitBtn.disabled = false;
        }
    );
}

// Task 2 (keyboard events): arrow keys move focus between menu items
function handleMenuKeys(event) {
    const current = navLinks.indexOf(document.activeElement);
    if (current === -1) {
        return;
    }

    let next = current;

    switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
            next = (current + 1) % navLinks.length;
            break;
        case "ArrowLeft":
        case "ArrowUp":
            next = (current - 1 + navLinks.length) % navLinks.length;
            break;
        case "Home":
            next = 0;
            break;
        case "End":
            next = navLinks.length - 1;
            break;
        default:
            return; // any other key: do nothing
    }

    event.preventDefault();
    navLinks[next].focus();
}

// ===== 4. Event listeners =====

if (navLinks.length > 0) {
    document.getElementById("siteNav").addEventListener("keydown", handleMenuKeys);
}

if (dayGreeting) {
    showGreeting();
}

if (timeBtn && timeOutput) {
    timeBtn.addEventListener("click", showCurrentTime);
}

if (filterButtons && recipeList && recipeCount) {
    renderRecipes(recipes);

    filterButtons.addEventListener("click", function (event) {
        const clicked = event.target.closest(".filter-btn");
        if (!clicked) {
            return;
        }

        // forEach is another higher-order function
        filterButtons.querySelectorAll(".filter-btn").forEach(function (button) {
            button.classList.remove("active");
        });
        clicked.classList.add("active");

        renderRecipes(filterRecipes(clicked.dataset.category));
        playSound("click");
    });
}

if (chefForm && chefMessage) {
    chefForm.addEventListener("submit", handleFormSubmit);
}