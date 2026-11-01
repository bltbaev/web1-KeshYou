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
            colorBtn.textContent = "Light Mode";
        } else {
            colorBtn.textContent = "Dark Mode";
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
    createRecipe("🍲", "Borscht", "lunch", 90),
    createRecipe("🍖", "Beshbarmak", "dinner", 150),
    createRecipe("🍰", "San Sebastian Cheesecake", "dessert", 60),
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

// =====================================================================
// ASSIGNMENT 6: jQuery
// All the code below runs inside $(document).ready().
// If an element is not on the current page, jQuery simply does nothing,
// so this code is safe to use on every page of the site.
// =====================================================================

// TASK 0: the function runs when the HTML page is fully loaded
$(document).ready(function () {

    console.log("jQuery is ready!");


    // ---------- Helper functions (used by several tasks) ----------

    // Returns true when the top of an element is already visible in the window
    function isInView($element) {
        var elementTop = $element.offset().top;
        var windowBottom = $(window).scrollTop() + $(window).height();
        return elementTop < windowBottom;
    }

    // TASK 7: a small message in the corner that disappears by itself
    function showToast(message) {
        $(".toast-message").remove();
        var $toast = $('<div class="toast-message"></div>').text(message);
        $("body").append($toast);
        $toast.fadeIn(300).delay(2000).fadeOut(500, function () {
            $(this).remove();
        });
    }


    // ---------- TASK 1: Real-time search and live filter ----------

    var $search = $("#recipeSearch");
    var $suggestions = $("#suggestions");

    function filterRecipeCards() {
        var keyword = $search.val().toLowerCase();

        $(".recipe-item").hide().filter(function () {
            var name = $(this).find("h4").text().toLowerCase();
            return name.includes(keyword);
        }).show();
    }


    // ---------- TASK 2: Autocomplete search suggestions ----------

    function showSuggestions() {
        var keyword = $search.val().toLowerCase();
        $suggestions.empty();

        if (keyword === "") {
            $suggestions.hide();
            return;
        }

        // "recipes" is the array of recipe objects from Assignment 5 (top of this file)
        var matches = recipes.filter(function (recipe) {
            return recipe.name.toLowerCase().includes(keyword);
        });

        $.each(matches, function (index, recipe) {
            $("<li></li>")
                .text(recipe.icon + " " + recipe.name)
                .attr("data-name", recipe.name)
                .appendTo($suggestions);
        });

        $suggestions.toggle(matches.length > 0);
    }

    // Every time a key is released in the search field
    $search.on("keyup", function () {
        filterRecipeCards();
        showSuggestions();
    });

    // Click on a suggestion: put its name into the field
    $suggestions.on("click", "li", function () {
        $search.val($(this).attr("data-name"));
        $suggestions.hide();
        $('.filter-btn[data-category="all"]').trigger("click");
        filterRecipeCards();
    });

    // After a category button re-draws the cards, apply the search again
    $("#filterButtons").on("click", ".filter-btn", function () {
        filterRecipeCards();
    });

    // Click anywhere outside the search box: close the suggestions
    $(document).on("click", function (event) {
        if ($(event.target).closest(".search-box").length === 0) {
            $suggestions.hide();
        }
    });


    // ---------- TASK 3: Search highlighting (breakfast.html) ----------

    var $textBlocks = $(".ingredients-list li, .steps-list li, .faq-question, .faq-answer p");

    // Remember the original text of every block
    $textBlocks.each(function () {
        $(this).data("original", $(this).text().trim());
    });

    $("#pageSearch").on("keyup", function () {
        var keyword = $(this).val().trim();
        var safeWord = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var regex = new RegExp("(" + safeWord + ")", "gi");

        $textBlocks.each(function () {
            var original = $(this).data("original");

            if (keyword === "") {
                $(this).text(original);
            } else {
                $(this).html(original.replace(regex, '<mark class="highlight">$1</mark>'));
            }
        });

        // Open the FAQ answers that contain a match
        $(".faq-item").removeClass("open");
        $("mark.highlight").closest(".faq-item").addClass("open");

        var count = $("mark.highlight").length;
        $("#searchResult").text(keyword === "" ? "" : "Matches found: " + count);
    });

    // FAQ: click on a question opens or closes its answer
    $(".faq-question").on("click", function () {
        $(this).closest(".faq-item").toggleClass("open");
    });


    // ---------- TASK 4: Scroll progress bar ----------

    $("body").prepend('<div id="scrollProgress"></div>');

    function updateProgressBar() {
        var scrollTop = $(window).scrollTop();
        var maxScroll = $(document).height() - $(window).height();
        var percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
        $("#scrollProgress").css("width", percent + "%");
    }


    // ---------- TASK 5: Animated number counter ----------

    var countersStarted = false;

    function startCounters() {
        var $stats = $(".stats-section");

        if (countersStarted || $stats.length === 0 || !isInView($stats)) {
            return;
        }
        countersStarted = true;

        $(".counter").each(function () {
            var $counter = $(this);
            var target = Number($counter.attr("data-target"));

            $({ value: 0 }).animate({ value: target }, {
                duration: 2000,
                step: function (now) {
                    $counter.text(Math.floor(now));
                },
                complete: function () {
                    $counter.text(target);
                }
            });
        });
    }


    // ---------- TASK 9: Image lazy loading ----------

    function lazyLoadImages() {
        $("img.lazy").each(function () {
            var $img = $(this);

            if (isInView($img.closest("section"))) {
                $img.attr("src", $img.attr("data-src"));
                $img.removeClass("lazy");
                console.log("Lazy loaded: " + $img.attr("alt"));
            }
        });
    }


    // ---------- One scroll listener for tasks 4, 5 and 9 ----------

    $(window).on("scroll", function () {
        updateProgressBar();
        startCounters();
        lazyLoadImages();
    });

    // Run once at the start for what is already visible
    updateProgressBar();
    startCounters();
    lazyLoadImages();


    // ---------- TASK 6: Loading spinner on submit (Subscribe popup) ----------

    $("#openPopup").on("click", function () {
        $("#popup").addClass("open");
    });

    $("#closePopup").on("click", function () {
        $("#popup").removeClass("open");
    });

    $("#popupForm").on("submit", function (event) {
        event.preventDefault();

        var email = $("#popEmail").val().trim();
        var $button = $(this).find("button[type='submit']");

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            $("#popEmailError").text("Please enter a valid email.");
            return;
        }
        $("#popEmailError").text("");

        // Show spinner and block the button
        $button.prop("disabled", true)
               .html('<span class="spinner-border spinner-border-sm"></span> Please wait...');

        // Pretend we are waiting for a server for 2 seconds
        setTimeout(function () {
            $button.prop("disabled", false).text("Subscribe");
            $("#popupForm")[0].reset();
            $("#popup").removeClass("open");
            showToast("✅ You are subscribed to new recipes!");
        }, 2000);
    });


    // ---------- TASK 8: Copy to clipboard button (recipe pages) ----------

    // Put a "Copy" button before every ingredients list
    $(".ingredients-list").before(
        '<button type="button" class="copy-btn">' +
            '<span class="copy-icon"></span> Copy ' +
            '<span class="copy-tooltip">Copied to clipboard!</span>' +
        '</button>'
    );

    $(".copy-btn").on("click", function () {
        var $button = $(this);

        // Collect every ingredient into one text, one per line
        var text = $button.next(".ingredients-list").find("li").map(function () {
            return "- " + $(this).text().trim();
        }).get().join("\n");

        navigator.clipboard.writeText(text).then(function () {
            $button.find(".copy-icon").text("✔");
            $button.find(".copy-tooltip").fadeIn(200);

            setTimeout(function () {
                $button.find(".copy-icon").text("📋");
                $button.find(".copy-tooltip").fadeOut(200);
            }, 2000);
        }).catch(function () {
            showToast("Sorry, copying is not allowed in this browser.");
        });
    });

    // TASK 7 + 8: when the user copies any text himself (Ctrl+C)
    $(document).on("copy", function () {
        showToast("📋 Copied to clipboard!");
    });

});
