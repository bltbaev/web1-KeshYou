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
            showToast("Your question was sent to the chef!", "success");
        },
        function () {
            showFormMessage("Something went wrong. Please try again.", "error-text");
            submitBtn.disabled = false;
            showToast("Could not send your question.", "error");
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


/* =====================================================================
   ASSIGNMENT 6: jQUERY
   Task 0 (setup), Task 7 (toasts), Task 8 (copy button), Task 9 (lazy loading)
   jQuery itself is loaded from the CDN in the <head> of every page.
   ===================================================================== */

// ===== TASK 7: Notification system (toast) =====
// Global function, so any code on the page can call showToast("text", "success")
function showToast(message, type, duration) {
    type = type || "info";
    duration = duration || 3000;

    // Create the container once and reuse it
    var $container = $("#toastContainer");
    if ($container.length === 0) {
        $container = $("<div>", {
            id: "toastContainer",
            role: "status",
            "aria-live": "polite"
        }).appendTo("body");
    }

    var icons = { success: "\u2713", error: "!", info: "i" };

    var $toast = $("<div>", { "class": "toast-msg " + type });
    $("<span>", { "class": "toast-icon", text: icons[type] || "i" }).appendTo($toast);
    $("<span>", { "class": "toast-text", text: message }).appendTo($toast);
    var $close = $("<button>", {
        type: "button",
        "class": "toast-close",
        "aria-label": "Close notification",
        html: "&times;"
    }).appendTo($toast);

    function removeToast() {
        $toast.stop(true, true).fadeOut(400, function () {
            $(this).remove();
        });
    }

    $close.on("click", removeToast);

    // Appear with a fade, wait, then fade out and remove from the DOM
    $toast.hide().appendTo($container).fadeIn(250).delay(duration).queue(function (next) {
        removeToast();
        next();
    });
}

// ===== TASK 8: Copy to clipboard =====
var copyIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect>' +
    '<path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>';
var checkIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4 12 10 18 20 6"></polyline></svg>';

// true while the button itself triggers a copy, so the "copy" event below does not show a second toast
var copiedByButton = false;

// Turns the list inside .copy-source into plain text (numbers for <ol>, dashes for <ul>)
function getSnippetText($source) {
    var isOrdered = $source.is("ol");
    var lines = [];
    $source.children("li").each(function (index) {
        var text = $(this).text().replace(/\s+/g, " ").trim();
        lines.push((isOrdered ? (index + 1) + ". " : "- ") + text);
    });
    return lines.join("\n");
}

// Copies text. Uses the Clipboard API, falls back to execCommand("copy") on old browsers / http
function copyToClipboard(text) {
    copiedByButton = true;
    var done = function () {
        setTimeout(function () { copiedByButton = false; }, 100);
    };

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(done, function (error) {
            done();
            throw error;
        });
    }

    return new Promise(function (resolve, reject) {
        var $temp = $("<textarea>").val(text)
            .css({ position: "fixed", top: 0, left: 0, opacity: 0 })
            .appendTo("body");
        $temp[0].select();
        var ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (error) {
            ok = false;
        }
        $temp.remove();
        done();
        if (ok) { resolve(); } else { reject(new Error("copy failed")); }
    });
}

// Puts the "copy" icon, label and the hidden tooltip inside every .copy-btn
function setupCopyButtons() {
    $(".copy-btn").each(function () {
        $(this).html(
            '<span class="copy-icon">' + copyIcon + '</span>' +
            '<span class="copy-label">Copy</span>' +
            '<span class="copy-tooltip" role="tooltip">Copied to clipboard!</span>'
        );
    });
}

function showCopiedState($btn) {
    $btn.addClass("copied");
    $btn.find(".copy-icon").html(checkIcon);          // icon -> checkmark
    $btn.find(".copy-label").text("Copied");
    $btn.find(".copy-tooltip").stop(true, true).fadeIn(150);

    // Return to the normal state after 2 seconds
    clearTimeout($btn.data("resetTimer"));
    $btn.data("resetTimer", setTimeout(function () {
        $btn.removeClass("copied");
        $btn.find(".copy-icon").html(copyIcon);
        $btn.find(".copy-label").text("Copy");
        $btn.find(".copy-tooltip").fadeOut(200);
    }, 2000));
}

// ===== TASK 9: Lazy loading images =====
// Images have a tiny placeholder in src and the real address in data-src.
function loadImage($img) {
    var realSrc = $img.attr("data-src");
    if (!realSrc) {
        return;
    }
    $img.one("load error", function () {
        $img.addClass("loaded");
    });
    $img.attr("src", realSrc).removeAttr("data-src");
}

// True when the image is (almost) inside the visible part of the window
function isNearViewport($img) {
    if (!$img.is(":visible")) {
        return false; // hidden images (inactive carousel slides) wait until they are shown
    }
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var imgTop = $img.offset().top;           // distance from the top of the page
    var imgBottom = imgTop + $img.outerHeight();
    var margin = 200;                          // start loading 200px before it appears
    return imgBottom > scrollTop - margin && imgTop < scrollTop + windowHeight + margin;
}

function loadVisibleImages() {
    $("img[data-src]").each(function () {
        if (isNearViewport($(this))) {
            loadImage($(this));
        }
    });
}

// ===== jQuery ready =====
$(document).ready(function () {

    // ---------- TASK 0: setup test ----------
    console.log("jQuery is ready!");

    // ---------- TASK 9: lazy loading ----------
    var scrollTimer = null;
    $(window).on("scroll resize", function () {
        if (scrollTimer) {
            return; // run at most once every 100 ms
        }
        scrollTimer = setTimeout(function () {
            scrollTimer = null;
            loadVisibleImages();
        }, 100);
    });
    loadVisibleImages(); // images that are already on screen when the page opens

    // Carousel: load the next slide's image just before it slides in
    var carousel = document.getElementById("recipeCarousel");
    if (carousel) {
        carousel.addEventListener("slide.bs.carousel", function (event) {
            loadImage($(event.relatedTarget).find("img[data-src]"));
        });
    }

    // ---------- TASK 8: copy buttons ----------
    setupCopyButtons();

    $(".copy-btn").on("click", function () {
        var $btn = $(this);
        var $source = $($btn.data("copyTarget"));
        var title = $btn.closest(".card-body").find(".card-title").first().text().trim();
        var label = $btn.data("copyLabel") || "Text";
        var text = (title ? title + " - " + label + "\n" : "") + getSnippetText($source);

        copyToClipboard(text).then(function () {
            showCopiedState($btn);
            showToast(label + " copied to clipboard!", "success");
        }, function () {
            showToast("Could not copy. Please select the text and press Ctrl+C.", "error");
        });
    });

    // The "copy" event: also notify when the user copies a snippet by hand (Ctrl+C / right click)
    $(document).on("copy", function () {
        if (copiedByButton) {
            return;
        }
        var selection = window.getSelection();
        if (selection && selection.toString() !== "" &&
            $(selection.anchorNode).closest(".copy-source").length > 0) {
            showToast("Copied to clipboard!", "success");
        }
    });

    // ---------- TASK 7: toasts for user actions ----------

    // Day / night mode button (the old vanilla handler runs first and toggles the class)
    $("#colorBtn").on("click", function () {
        var isDark = $("body").hasClass("dark-mode");
        showToast(isDark ? "Night mode is on" : "Day mode is on", "info", 2000);
    });

    // Star rating on the About page
    $("#starRating").on("click", ".star", function () {
        showToast("Thanks for your rating!", "success");
    });

    // Subscribe pop-up on the Home page (addClass / removeClass are safe to repeat)
    $("#openPopup").on("click", function () {
        $("#popup").addClass("open");
    });
    $("#closePopup").on("click", function () {
        $("#popup").removeClass("open");
    });
    $("#popup").on("click", function (event) {
        if (event.target === this) {
            $(this).removeClass("open");
        }
    });
    $("#popupForm").on("submit", function (event) {
        event.preventDefault();
        var email = $("#popEmail").val().trim();
        var $error = $("#popEmailError");

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            $error.text("Please enter a valid email.");
            showToast("Please enter a valid email.", "error");
            return;
        }
        $error.text("");
        this.reset();
        $("#popup").removeClass("open");
        showToast("Subscribed successfully!", "success");
    });

    // Sign up form on the About page
    $("#signupForm").on("submit", function (event) {
        event.preventDefault();
        var name = $("#suName").val().trim();
        var email = $("#suEmail").val().trim();
        var password = $("#suPassword").val();
        var confirm = $("#suConfirm").val();
        var valid = true;

        $("#suNameError").text(name === "" ? "Name is required." : "");
        $("#suEmailError").text(/^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email.");
        $("#suPasswordError").text(password.length >= 8 ? "" : "Password must have at least 8 characters.");
        $("#suConfirmError").text(password === confirm ? "" : "Passwords do not match.");

        $(this).find(".error").each(function () {
            if ($(this).text() !== "") {
                valid = false;
            }
        });

        if (!valid) {
            showToast("Please fix the errors in the form.", "error");
            return;
        }
        this.reset();
        showToast("Welcome, " + name + "! Account created.", "success");
    });
});
